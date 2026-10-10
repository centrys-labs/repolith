import type { Metadata } from "next";

import { NotificationsContent } from "@/components/notifications/notifications-content";
import { getNotifications } from "@/lib/github";

export const metadata: Metadata = {
	title: "Notifications",
};

export default async function NotificationsPage() {
	const notifications = await getNotifications(50);
	return (
		<NotificationsContent
			notifications={
				notifications as Array<{
					id: string;
					reason: string;
					subject: {
						title: string;
						type: string;
						url: string | null;
					};
					repository: { full_name: string; html_url: string };
					updated_at: string;
					unread: boolean;
				}>
			}
		/>
	);
}
