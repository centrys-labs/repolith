// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENSITIVE_PATTERNS = /authorization|cookie|token|secret|password|pat|apikey|api_key/i;

Sentry.init({
	enabled: process.env.NODE_ENV === "production",
	dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

	tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,

	// Preserve the v10 restrictive collection defaults (v11 collects more by default).
	// https://docs.sentry.io/platforms/javascript/migration/v10-to-v11/#data-collection
	dataCollection: {
		userInfo: false,
		cookies: false,
		httpHeaders: {
			request: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
			response: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
		},
		httpBodies: [],
		urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
		genAI: { inputs: false, outputs: false },
		databaseQueryData: false,
		graphQL: { document: false, variables: false },
	},

	beforeSend(event) {
		if (event.request?.headers) {
			for (const key of Object.keys(event.request.headers)) {
				if (SENSITIVE_PATTERNS.test(key)) {
					event.request.headers[key] = "[REDACTED]";
				}
			}
		}
		if (event.request?.cookies) {
			event.request.cookies = {};
		}
		return event;
	},
});
