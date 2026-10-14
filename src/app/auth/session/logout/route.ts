import { createAuthSessionLogoutRoute } from "@schemavaults/auth-server-sdk/auth-session-route";
import { getAppId } from "@/lib/getAppId";

// POST /auth/session/logout — revokes the session at the auth server and
// clears this app's session cookie (see ../token/route.ts, also for why these
// routes are customized).
export const { POST } = createAuthSessionLogoutRoute({
  client_app_id: getAppId(),
});

export const dynamic = "force-dynamic";
