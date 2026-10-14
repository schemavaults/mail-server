import { createAuthSessionWhoamiRoute } from "@schemavaults/auth-server-sdk/auth-session-route";
import { getAppId } from "@/lib/getAppId";

// GET /auth/session/whoami — the signed-in user, loaded from the auth
// server with the refresh token this app's session cookie holds (see
// ../token/route.ts, also for why these routes are customized).
export const { GET } = createAuthSessionWhoamiRoute({
  client_app_id: getAppId(),
});

export const dynamic = "force-dynamic";
