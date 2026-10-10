import type { Metadata } from "next";

import { ReposContent } from "@/components/repos/repos-content";
import { getUserRepos } from "@/lib/github";

export const metadata: Metadata = {
	title: "Repositories",
};

export default async function ReposPage() {
	const repos = await getUserRepos("updated", 50);
	return <ReposContent repos={repos} />;
}
