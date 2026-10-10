"use server";

import { renderMarkdownToHtml } from "@/components/shared/markdown-renderer";
import { getRepoReleasesPage } from "@/lib/github";

export async function fetchReleasesPage(owner: string, repo: string, page: number) {
	const raw = await getRepoReleasesPage(owner, repo, page);

	return Promise.all(
		raw.map(async (r) => {
			const bodyHtml = r.body
				? await renderMarkdownToHtml(r.body, {
						owner,
						repo,
						branch: r.target_commitish,
					})
				: null;
			return { ...r, body: r.body ?? null, bodyHtml };
		}),
	);
}
