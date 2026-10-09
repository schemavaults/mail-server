import "server-only";

import {
  isOperationError,
  OperationError,
  OPERATION_ERROR_CODES,
  type AuthPrincipal,
  type AuthResolver,
  type AuthResolvers,
} from "@schemavaults/openapi-operations";
import {
  createSchemaVaultsAuthResolvers,
  SCHEMAVAULTS_AUTH_RESOLVER_ERROR_CODES,
} from "@schemavaults/auth-server-sdk/openapi-operations";
import { getAppId } from "@/lib/getAppId";
import { extractBearerToken } from "@/lib/api-keys/extractBearerToken";
import { API_KEY_PREFIX } from "@/lib/api-keys/API_KEY_PREFIX";
import { validateApiKeyFromRequest } from "@/lib/api-keys/validateApiKeyFromRequest";
import {
  accessTokenBearerScheme,
  accessTokenCookieScheme,
  mailApiKeyScheme,
} from "./auth-schemes";
import type { MailServerUser } from "./define-operation";

type MailServerAuthResolver = AuthResolver<MailServerUser, undefined>;

let schemaVaultsResolvers: AuthResolvers<MailServerUser, undefined> | null =
  null;

/**
 * The auth-server-sdk's access-token resolvers, created on first use so the
 * API server id (the tokens' audience and the cookie name) is read from the
 * runtime environment rather than whatever was set at build time.
 */
function getSchemaVaultsResolvers(): AuthResolvers<MailServerUser, undefined> {
  schemaVaultsResolvers ??= createSchemaVaultsAuthResolvers<undefined>({
    apiServerId: getAppId(),
  });
  return schemaVaultsResolvers;
}

/**
 * Verifies an access token through the auth-server-sdk resolver registered
 * under `schemeName`, then refuses non-admin users: every operation on this
 * mail server that accepts an access token is admin-only (mirroring the
 * `withAdminApiRouteGuard` these operations replaced), including those that
 * also accept an API key and so cannot use the "admin" route guard.
 *
 * A 500 the SDK raises because token verification is not configured names
 * the missing setting; that detail is already logged server-side, so callers
 * get the generic message the replaced guard answered with.
 */
function adminAccessTokenResolver(schemeName: string): MailServerAuthResolver {
  return async (c, scheme, context) => {
    const resolve = getSchemaVaultsResolvers()[schemeName];
    if (!resolve) {
      throw new TypeError(`No auth-server-sdk resolver for '${schemeName}'!`);
    }
    let principal: Awaited<ReturnType<typeof resolve>>;
    try {
      principal = await resolve(c, scheme, context);
    } catch (e: unknown) {
      if (
        isOperationError(e) &&
        e.body.error === SCHEMAVAULTS_AUTH_RESOLVER_ERROR_CODES.notConfigured
      ) {
        throw new OperationError(500, {
          error: OPERATION_ERROR_CODES.internal,
          message: "Internal Server Error",
        });
      }
      throw e;
    }
    if (principal && !principal.isAdmin) {
      throw new OperationError(403, {
        error: OPERATION_ERROR_CODES.forbidden,
        message: "Administrator access required",
      });
    }
    return principal;
  };
}

/**
 * Resolves a mail-server API key presented as `Authorization: Bearer
 * svlts_mail_pk_...`. Any other (or no) bearer credential yields null, so
 * the admin access-token resolvers get their turn; a key-shaped credential
 * that is unknown or revoked is refused outright. The key's ID travels as
 * the principal's `clientId` (see `apiKeyIdOf`).
 */
const resolveMailApiKey: MailServerAuthResolver = async (c, scheme) => {
  const token = extractBearerToken(c.req.raw);
  if (token === null || !token.startsWith(API_KEY_PREFIX)) return null;

  const result = await validateApiKeyFromRequest(c.req.raw);
  if (!result.valid) {
    throw new OperationError(
      401,
      { error: "invalid_api_key", message: "Invalid or revoked API key." },
      scheme.challenge
        ? { "WWW-Authenticate": `${scheme.challenge}, error="invalid_token"` }
        : {},
    );
  }
  return {
    scheme: scheme.name,
    user: null,
    isAdmin: false,
    scope: null,
    clientId: result.record.api_key_id,
  } satisfies AuthPrincipal<MailServerUser>;
};

/** Credential resolvers for every scheme in ./auth-schemes.ts. */
export const mailServerAuthResolvers: AuthResolvers<MailServerUser, undefined> =
  {
    [accessTokenBearerScheme.name]: adminAccessTokenResolver(
      accessTokenBearerScheme.name,
    ),
    [accessTokenCookieScheme.name]: adminAccessTokenResolver(
      accessTokenCookieScheme.name,
    ),
    [mailApiKeyScheme.name]: resolveMailApiKey,
  };
