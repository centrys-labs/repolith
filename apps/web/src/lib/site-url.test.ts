import { describe, expect, it } from "vitest";

import { getAppUrl, PRODUCTION_URL } from "./site-url";

describe("getAppUrl", () => {
	it("uses the canonical production origin", () => {
		expect(getAppUrl({ NODE_ENV: "production" })).toBe(PRODUCTION_URL);
	});
	it("keeps local development on localhost", () => {
		expect(getAppUrl({ NODE_ENV: "development" })).toBe("http://localhost:3000");
	});
	it("uses a Vercel preview origin when no explicit URL is configured", () => {
		expect(
			getAppUrl({
				NODE_ENV: "production",
				VERCEL_ENV: "preview",
				VERCEL_URL: "preview.vercel.app",
			}),
		).toBe("https://preview.vercel.app");
	});
	it("prefers the configured URL and strips trailing slashes", () => {
		expect(getAppUrl({ NEXT_PUBLIC_APP_URL: "https://staging.example.com/" })).toBe(
			"https://staging.example.com",
		);
	});
});
