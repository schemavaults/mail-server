import {
  createOperationDefiner,
  OperationError,
  OPERATION_ERROR_CODES,
  type AuthPrincipal,
} from "@schemavaults/openapi-operations";
import type { UserData } from "@schemavaults/auth-server-sdk";
import { mailApiKeyScheme } from "./auth-schemes";

/** The user an admin access token resolves to (see ./auth-resolvers.ts). */
export type MailServerUser = UserData;

/**
 * `defineOperation` bound to this app's types. Operations carry no
 * per-request context (handlers open their own `ServerlessDatabase` handle
 * where they need one); `ctx.auth.user` is the admin behind an access token.
 *
 * Each route folder under src/app/api keeps its operations in an
 * `operations.ts` beside the `route.ts` serving them, and every operation
 * must also be listed in the catalogue (./operations.ts).
 */
export const defineOperation = createOperationDefiner<
  undefined,
  MailServerUser
>();

/**
 * The API key that authenticated the request, or null for an admin access
 * token (admins bypass every API-key scope).
 *
 * Fails closed rather than ever returning null for a caller that is not
 * verifiably an admin: an API-key principal without its key ID, or any other
 * principal without admin rights, is refused instead of bypassing scopes.
 */
export function apiKeyIdOf(
  auth: AuthPrincipal<MailServerUser>,
): string | null {
  if (auth.scheme === mailApiKeyScheme.name) {
    if (typeof auth.clientId !== "string" || auth.clientId.length === 0) {
      throw new OperationError(401, {
        error: "invalid_api_key",
        message: "Invalid or revoked API key.",
      });
    }
    return auth.clientId;
  }
  if (!auth.isAdmin) {
    throw new OperationError(403, {
      error: OPERATION_ERROR_CODES.forbidden,
      message: "Administrator access required",
    });
  }
  return null;
}
