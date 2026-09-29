import "server-only";

import {
  defineAuthScheme,
  requireAuth,
  schemaVaultsAccessTokenBearerScheme,
  schemaVaultsAccessTokenCookieScheme,
} from "@schemavaults/openapi-operations";
import { AccessTokenCookieName } from "@schemavaults/auth-server-sdk";
import { getAppId } from "@/lib/getAppId";
import { API_KEY_PREFIX } from "@/lib/api-keys/API_KEY_PREFIX";

// The credentials this mail server's operations accept. The schemes only
// DESCRIBE how a credential travels (they become the document's
// `components.securitySchemes`); ./auth-resolvers.ts verifies them.
//
// Every operation that accepts a SchemaVaults access token is admin-only:
// the resolvers refuse non-admin users outright (403), so the admin
// requirement holds even for operations that also accept an API key and
// therefore cannot declare the "admin" route guard.

/** `Authorization: Bearer <access token>` issued by the auth server. */
export const accessTokenBearerScheme = schemaVaultsAccessTokenBearerScheme;

/** The first-party access-token cookie set for this API server after login. */
export const accessTokenCookieScheme = schemaVaultsAccessTokenCookieScheme(
  AccessTokenCookieName(getAppId()),
);

/** A mail-server API key (`svlts_mail_pk_...`) created at /admin/keys. */
export const mailApiKeyScheme = defineAuthScheme({
  name: "mail-server-api-key",
  title: "Mail-server API key (Bearer)",
  description:
    `A mail-server API key (\`${API_KEY_PREFIX}...\`) created by an admin at /admin/keys, sent as \`Authorization: Bearer <key>\`. ` +
    "Subject to the key's audience, sender, and transport scopes.",
  securityScheme: {
    type: "http",
    scheme: "bearer",
    description: `Mail-server API key (\`${API_KEY_PREFIX}...\`) created by an admin at /admin/keys.`,
  },
  challenge: 'Bearer realm="mail-server-api-key"',
});

/** The admin access-token schemes, in the order they are tried. */
const adminSchemes = [accessTokenBearerScheme, accessTokenCookieScheme] as const;

/** Operations only an admin (SchemaVaults access token) may call. */
export function adminAuth() {
  return requireAuth({ schemes: adminSchemes, routeGuard: "admin" });
}

/**
 * Operations that accept EITHER a mail-server API key or an admin access
 * token. The API key is tried first, so a `Bearer svlts_mail_pk_...` header
 * is never mistaken for a JWT. The route guard is "authenticated" because an
 * API key is not an admin; admin-only-ness of the token path is enforced by
 * the resolvers (see above) and stated in the docs notes. Handlers learn
 * which path authenticated the caller via `apiKeyIdOf(ctx.auth)`.
 */
export function apiKeyOrAdminAuth(notes: string) {
  return requireAuth({
    schemes: [mailApiKeyScheme, ...adminSchemes] as const,
    routeGuard: "authenticated",
    notes: `Access tokens must belong to an admin (other users get 403). ${notes}`,
  });
}
