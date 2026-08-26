import "server-only";

import type { Context } from "hono";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import {
  requestLooksLikeApiKeyAuth,
  validateApiKeyFromRequest,
} from "@/lib/api-keys/validateApiKeyFromRequest";
import { unauthorized } from "./responses";
import { toNextRequest, toNextResponse } from "./next-interop";

export { toNextRequest } from "./next-interop";

type TAdminRouteHandler = Parameters<typeof withAdminApiRouteGuard>[0];
type TAdminRouteHandlerProps = Parameters<TAdminRouteHandler>[0];

/** The authenticated admin user the auth-server-sdk guard resolves. */
export type AdminRouteUser = TAdminRouteHandlerProps["user"];

/**
 * Runs `handler` behind the admin JWT guard (`user.admin` required). The
 * Hono equivalent of wrapping a handler in `withAdminApiRouteGuard`: the
 * guard's own 401/403 responses pass through untouched, and the handler only
 * runs for an authenticated admin.
 *
 *   app.get("/", (c) =>
 *     runWithAdminGuard(c, async ({ user }) => jsonData(c, ...)),
 *   );
 */
export async function runWithAdminGuard(
  c: Context,
  handler: (opts: { user: AdminRouteUser }) => Promise<Response>,
): Promise<Response> {
  const protected_route = await withAdminApiRouteGuard(async ({ user }) =>
    toNextResponse(await handler({ user })),
  );
  return await protected_route(toNextRequest(c));
}

export interface ApiKeyOrAdminAuthContext {
  /** Non-null when the caller authenticated via a mail-server API key. */
  apiKeyId: string | null;
}

/**
 * Runs `handler` behind EITHER auth path accepted by the programmatic
 * endpoints (/api/send, /api/templates): a mail-server API key
 * (`svlts_mail_pk_...` bearer token, validated against the API_KEYS table)
 * or the admin JWT guard. The handler learns which path authenticated the
 * caller via `auth.apiKeyId` so it can apply per-key scope enforcement —
 * admin JWT callers get `apiKeyId: null` and bypass all scopes.
 */
export async function runWithApiKeyOrAdminGuard(
  c: Context,
  handler: (auth: ApiKeyOrAdminAuthContext) => Promise<Response>,
): Promise<Response> {
  const req = toNextRequest(c);

  // API-key path: if the caller is presenting a token that looks like a
  // mail-server API key, validate it against the API_KEYS table and skip
  // the admin JWT guard entirely.
  if (requestLooksLikeApiKeyAuth(req)) {
    const result = await validateApiKeyFromRequest(req);
    if (!result.valid) {
      return unauthorized(c, "Invalid or revoked API key.");
    }
    return await handler({ apiKeyId: result.record.api_key_id });
  }

  // Fallback path: the admin JWT guard.
  const protected_route = await withAdminApiRouteGuard(async () =>
    toNextResponse(await handler({ apiKeyId: null })),
  );
  return await protected_route(req);
}
