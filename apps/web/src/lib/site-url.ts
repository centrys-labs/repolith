export const PRODUCTION_URL = "https://repolith.my.id";

export function getAppUrl(
	env: {
		NEXT_PUBLIC_APP_URL?: string;
		NODE_ENV?: string;
		VERCEL_ENV?: string;
		VERCEL_URL?: string;
	} = process.env,
): string {
	if (env.NEXT_PUBLIC_APP_URL) return env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
	if (env.VERCEL_ENV && env.VERCEL_ENV !== "production" && env.VERCEL_URL) {
		return `https://${env.VERCEL_URL}`;
	}
	return env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000";
}
