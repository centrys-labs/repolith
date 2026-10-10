import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const extensions = ["chrome-extension", "firefox-extension"] as const;

describe.each(extensions)("%s host migration", (extension) => {
	function install(storedHost: string, enabled = true) {
		let onInstalled: () => void = () => {
			throw new Error("onInstalled listener was not registered");
		};
		const set = vi.fn(() => Promise.resolve());
		const updateEnabledRulesets = vi.fn(() => Promise.resolve());
		const updateDynamicRules = vi.fn(() => Promise.resolve());
		const getDynamicRules = vi.fn((callback?: (rules: { id: number }[]) => void) => {
			const rules = [{ id: 101 }];
			if (callback) return callback(rules);
			return Promise.resolve(rules);
		});
		const storage = {
			get: (
				_keys: string[],
				callback?: (data: { host: string; enabled: boolean }) => void,
			) => {
				const data = { host: storedHost, enabled };
				if (callback) return callback(data);
				return Promise.resolve(data);
			},
			set,
		};
		const api = {
			action: { setIcon: () => Promise.resolve() },
			declarativeNetRequest: {
				getDynamicRules,
				updateDynamicRules,
				updateEnabledRulesets,
			},
			runtime: {
				onInstalled: {
					addListener: (listener: () => void) =>
						(onInstalled = listener),
				},
				onMessage: { addListener: () => {} },
			},
			storage: { local: storage },
			webNavigation: {
				onBeforeNavigate: { addListener: () => {} },
				onCommitted: { addListener: () => {} },
			},
		};
		const source = readFileSync(
			resolve(
				import.meta.dirname,
				`../../../../packages/${extension}/background.js`,
			),
			"utf8",
		);
		runInNewContext(source, {
			[extension === "chrome-extension" ? "chrome" : "browser"]: api,
		});
		onInstalled();
		return { set, updateDynamicRules, updateEnabledRulesets };
	}

	it("migrates the stored old default to the new static host", async () => {
		const calls = install("https://repolith.dev");
		await new Promise((done) => setImmediate(done));
		expect(calls.set).toHaveBeenCalledWith({
			enabled: true,
			host: "https://repolith.my.id",
		});
		expect(calls.updateDynamicRules).toHaveBeenCalledWith({ removeRuleIds: [101] });
		expect(calls.updateEnabledRulesets).toHaveBeenCalledWith({
			enableRulesetIds: ["redirect_rules"],
		});
	});

	it("uses the new host on first install", async () => {
		const calls = install("");
		await new Promise((done) => setImmediate(done));
		expect(calls.set).toHaveBeenCalledWith({
			enabled: true,
			host: "https://repolith.my.id",
		});
		expect(calls.updateEnabledRulesets).toHaveBeenCalledWith({
			enableRulesetIds: ["redirect_rules"],
		});
	});

	it("preserves a custom host and installs dynamic redirects", async () => {
		const calls = install("https://my-instance.example");
		await new Promise((done) => setImmediate(done));
		expect(calls.set).toHaveBeenCalledWith({
			enabled: true,
			host: "https://my-instance.example",
		});
		expect(calls.updateDynamicRules).toHaveBeenCalledWith(
			expect.objectContaining({
				addRules: expect.arrayContaining([
					expect.objectContaining({
						action: {
							type: "redirect",
							redirect: {
								regexSubstitution:
									"https://my-instance.example/\\1/\\2/pull/\\3",
							},
						},
					}),
				]),
			}),
		);
	});

	it("does not enable redirects when the user paused the extension", async () => {
		const calls = install("https://repolith.dev", false);
		await new Promise((done) => setImmediate(done));
		expect(calls.set).toHaveBeenCalledWith({
			enabled: false,
			host: "https://repolith.my.id",
		});
		expect(calls.updateEnabledRulesets).toHaveBeenCalledWith({
			disableRulesetIds: ["redirect_rules"],
		});
	});
});
