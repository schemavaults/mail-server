import {
  createOperationDefiner,
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
 */
export function apiKeyIdOf(
  auth: AuthPrincipal<MailServerUser>,
): string | null {
  return auth.scheme === mailApiKeyScheme.name ? (auth.clientId ?? null) : null;
}
