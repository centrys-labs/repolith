# Production domain cutover

The canonical production origin is `https://repolith.my.id`. Local development remains `http://localhost:3000`. Keep preview deployments on their own Vercel origins; do not assign the production URL to the preview environment.

## Deployment checklist

1. In the Vercel project, add and verify `repolith.my.id` as the production domain. Point its DNS records at the values Vercel provides, confirm the TLS certificate is valid, and deploy the domain-migration commit.
2. In the Vercel **Production** environment, set `BETTER_AUTH_URL=https://repolith.my.id` and `NEXT_PUBLIC_APP_URL=https://repolith.my.id`. Update any other externally configured absolute app URLs. Redeploy so the public variable is included in the client bundle. Leave local `.env` values as localhost.
3. In the GitHub OAuth App configuration, set the homepage to `https://repolith.my.id` and the authorization callback URL to **`https://repolith.my.id/api/auth/callback/github`**. The route is registered at `apps/web/src/app/api/auth/[...all]/route.ts` through Better Auth's Next.js handler. Do not rotate or commit the client ID or secret as part of this change. Restart in-flight sign-ins after the Better Auth upgrade.
4. The OAuth proxy uses the production origin for trusted Vercel previews. If production and trusted previews have distinct `BETTER_AUTH_SECRET` values, configure the same **dedicated** `OAUTH_PROXY_SECRET` in both environments. This secret grants authority to assert identities through the proxy; never provide it to untrusted pull-request preview code. Verify a sign-in on production and on a trusted preview before retiring the old callback.
5. Update Polar's webhook destination to `https://repolith.my.id/api/billing/webhooks/polar` and verify its signature with the existing secret. Check any Polar checkout success/cancel links, Inngest callback `https://repolith.my.id/api/inngest`, GitHub webhooks, Sentry site URLs, and email templates in their respective dashboards. Do not rename the Sentry organization (`kaltdev` in source) without confirming that external account's identity.
6. Install the rebuilt Chrome and Firefox extension downloads and verify first-install redirects, upgrades with the previous stored default, and a configured custom host. Existing release/store listings must be updated separately if applicable.
7. Only if the previous domain is still controlled: configure a permanent redirect from `repolith.dev` and `www.repolith.dev` to the new host, preserving paths and query strings. No such redirect is asserted by this repository change.

GitHub private vulnerability reporting is enabled on `centrys-labs/repolith`, and `SECURITY.md` directs reporters to its private form. Confirm that maintainers are subscribed to security alerts before retiring the old mailbox; no new monitored email address is assumed.
