import "server-only";

import {
  apiServerIdSchema,
  type ApiServerId,
} from "@schemavaults/app-definitions";

export const DEFAULT_SCHEMAVAULTS_MAIL_APP_ID = "schemavaults-mail";

/**
 * @description Resolves this mail server's application / API server ID — used
 * as the JWT audience when acquiring access tokens and as the `api_server_id`
 * for route guards — from the `SCHEMAVAULTS_API_SERVER_ID` environment
 * variable, falling back to "schemavaults-mail" when it is not set.
 *
 * Server-only: client components receive the resolved value through
 * `<MailAppIdProvider>` / `useMailAppId()` (see
 * `src/contexts/MailAppIdContext.tsx`), threaded down from the root layout.
 *
 * @throws if a configured value is not a valid API server ID
 */
export function getAppId(): ApiServerId {
  const candidate: string | undefined = process.env.SCHEMAVAULTS_API_SERVER_ID;
  if (typeof candidate !== "string" || candidate.length === 0) {
    return DEFAULT_SCHEMAVAULTS_MAIL_APP_ID;
  }
  const parsed = apiServerIdSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new TypeError(
      "Invalid mail server app ID set via the 'SCHEMAVAULTS_API_SERVER_ID' environment variable!",
      { cause: parsed.error },
    );
  }
  return parsed.data;
}

export default getAppId satisfies () => ApiServerId;
