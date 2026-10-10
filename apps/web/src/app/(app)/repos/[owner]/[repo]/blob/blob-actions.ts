"use server";

import { revalidatePath } from "next/cache";

import { getOctokit, invalidateFileContentCache } from "@/lib/github";
import { invalidateRepoCache } from "@/lib/repo-data-cache-vc";
import { getErrorMessage } from "@/lib/utils";

export async function commitFileEdit(
	owner: string,
	repo: string,
	path: string,
	branch: string,
	content: string,
	sha: string,
	commitMessage: string,
) {
	const octokit = await getOctokit();
	if (!octokit) return { error: "Not authenticated" };

	try {
		const { data } = await octokit.repos.createOrUpdateFileContents({
			owner,
			repo,
			path,
			message: commitMessage,
			content: Buffer.from(content).toString("base64"),
			sha,
			branch,
		});

		await invalidateFileContentCache(owner, repo, path, branch);
		invalidateRepoCache(owner, repo);
		revalidatePath(`/repos/${owner}/${repo}/blob`);

		return { success: true, newSha: data.content?.sha };
	} catch (e: unknown) {
		return { error: getErrorMessage(e) };
	}
}
