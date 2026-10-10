import { waitUntil } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";

import { warmRepoPageDataBatch } from "@/lib/github";
import { normalizeRepoFullNames } from "@/lib/repo-warming";

export async function POST(request: NextRequest) {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
	}

	const repos = normalizeRepoFullNames(
		Array.isArray((payload as { repos?: unknown })?.repos)
			? ((payload as { repos: unknown[] }).repos.filter(
					(repo): repo is string => typeof repo === "string",
				) as string[])
			: [],
	);

	if (repos.length === 0) {
		return NextResponse.json({ queued: 0 }, { status: 202 });
	}

	waitUntil(warmRepoPageDataBatch(repos));

	return NextResponse.json({ queued: repos.length }, { status: 202 });
}
