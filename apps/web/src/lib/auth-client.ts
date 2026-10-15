import { dashClient, sentinelClient } from "@better-auth/infra/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
		dashClient(),
		sentinelClient({
			identifyUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_IDENTIFY_URL!,
		}),
	],
});

export const { signIn, signOut, useSession } = authClient;
