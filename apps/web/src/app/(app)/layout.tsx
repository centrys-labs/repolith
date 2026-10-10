import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { NavAwareContent } from "@/components/layout/nav-aware-content";
import { AppNavbar } from "@/components/layout/navbar";
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";
import { GitHubLinkInterceptor } from "@/components/shared/github-link-interceptor";
import { GlobalChatPanel } from "@/components/shared/global-chat-panel";
import { GlobalChatProvider } from "@/components/shared/global-chat-provider";
import { MutationEventProvider } from "@/components/shared/mutation-event-provider";
import { NavVisibilityProvider } from "@/components/shared/nav-visibility-provider";
import { NavigationProgress } from "@/components/shared/navigation-progress";
import { ResponsiveSurfaceProvider } from "@/components/shared/responsive-surface-provider";
import { IconThemeProvider } from "@/components/theme-store/icon-theme-provider";
import { ColorThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getServerSession } from "@/lib/auth";
import { type GhostTabState } from "@/lib/chat-store";
import { getNotifications, checkIsStarred } from "@/lib/github";
import type { NotificationItem } from "@/lib/github-types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const session = await getServerSession();
	if (!session) {
		const headersList = await headers();
		const pathname = headersList.get("x-pathname") || "";
		const redirectTo =
			pathname && pathname !== "/"
				? `/?redirect=${encodeURIComponent(pathname)}`
				: "/";
		return redirect(redirectTo);
	}

	let notifications: NotificationItem[] = [];
	try {
		notifications = (await getNotifications(20)) as NotificationItem[];
	} catch {
		// Swallow rate-limit / network errors so the layout still renders.
		// Individual pages will throw their own errors caught by error.tsx.
	}

	const onboardingDone = session?.user?.onboardingDone ?? false;
	let initialStarredAuth = false;
	let initialStarredHub = false;
	if (!onboardingDone) {
		try {
			[initialStarredAuth, initialStarredHub] = await Promise.all([
				checkIsStarred("better-auth", "better-auth"),
				checkIsStarred("better-auth", "better-hub"),
			]);
		} catch {
			// Same — don't let secondary API failures crash the shell.
		}
	}

	const freshTabId = crypto.randomUUID();
	const initialTabState: GhostTabState = {
		tabs: [{ id: freshTabId, label: "New chat" }],
		activeTabId: freshTabId,
		counter: 1,
	};

	return (
		<NuqsAdapter>
			<GlobalChatProvider initialTabState={initialTabState}>
				<MutationEventProvider>
					<ResponsiveSurfaceProvider>
						<ColorThemeProvider>
							<IconThemeProvider>
								<GitHubLinkInterceptor>
									<TooltipProvider>
										<NavigationProgress />
										<NavVisibilityProvider>
											<div className="flex flex-col h-dvh overflow-y-auto lg:overflow-hidden">
												<AppNavbar
													session={
														session
													}
													notifications={
														notifications
													}
												/>
												<NavAwareContent>
													{
														children
													}
												</NavAwareContent>
												<Suspense>
													<GlobalChatPanel />
												</Suspense>
											</div>
										</NavVisibilityProvider>
										<OnboardingOverlay
											userName={
												session
													?.githubUser
													?.name ||
												session
													?.githubUser
													?.login ||
												""
											}
											userAvatar={
												session
													?.githubUser
													?.avatar_url ||
												""
											}
											bio={
												session
													?.githubUser
													?.bio ||
												""
											}
											company={
												session
													?.githubUser
													?.company ||
												""
											}
											location={
												session
													?.githubUser
													?.location ||
												""
											}
											publicRepos={
												session
													?.githubUser
													?.public_repos ??
												0
											}
											followers={
												session
													?.githubUser
													?.followers ??
												0
											}
											createdAt={
												session
													?.githubUser
													?.created_at ||
												""
											}
											onboardingDone={
												onboardingDone
											}
											initialStarredAuth={
												initialStarredAuth
											}
											initialStarredHub={
												initialStarredHub
											}
										/>
									</TooltipProvider>
								</GitHubLinkInterceptor>
							</IconThemeProvider>
						</ColorThemeProvider>
					</ResponsiveSurfaceProvider>
				</MutationEventProvider>
			</GlobalChatProvider>
		</NuqsAdapter>
	);
}
