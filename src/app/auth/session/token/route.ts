import { createAuthSessionTokenRoute } from "@schemavaults/auth-server-sdk/auth-session-route";
import { getAppId } from "@/lib/getAppId";

// POST /auth/session/token — one of the app's auth session routes (with
// ../whoami and ../logout). The auth provider sends the SDK's token requests
// here; this route forwards them to the auth server and keeps the refresh
// token in an HTTP-only cookie on this app's own domain: page scripts can
// never read it, and as a first-party cookie it works in browsers that block
// third-party cookies (Safari, every iOS browser).
//
// Customized from the `auth-codegen` template, which reads the app ID from
// SCHEMAVAULTS_CLIENT_APP_ID: these routes use getAppId() — the same ID the
// root layout hands <AuthProvider> — so no extra environment variable is
// needed. Without the codegen marker comment, codegen leaves these files
// alone; the auth server URL and environment still come from
// SCHEMAVAULTS_AUTH_SERVER_URL and SCHEMAVAULTS_APP_ENVIRONMENT.
export const { POST } = createAuthSessionTokenRoute({
  client_app_id: getAppId(),
});

export const dynamic = "force-dynamic";
