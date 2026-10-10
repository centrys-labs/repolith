import type { Metadata } from "next";

import { TrendingContent } from "@/components/trending/trending-content";
import { getTrendingRepos } from "@/lib/github";

export const metadata: Metadata = {
	title: "Trending",
};

export default async function TrendingPage() {
	const [weekly, daily, monthly] = await Promise.all([
		getTrendingRepos(undefined, "weekly", 25),
		getTrendingRepos(undefined, "daily", 25),
		getTrendingRepos(undefined, "monthly", 25),
	]);

	return (
		<TrendingContent
			weekly={
				weekly as unknown as Parameters<typeof TrendingContent>[0]["weekly"]
			}
			daily={daily as unknown as Parameters<typeof TrendingContent>[0]["daily"]}
			monthly={
				monthly as unknown as Parameters<
					typeof TrendingContent
				>[0]["monthly"]
			}
		/>
	);
}
