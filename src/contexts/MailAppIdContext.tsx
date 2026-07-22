"use client";

import {
  apiServerIdSchema,
  type ApiServerId,
} from "@schemavaults/app-definitions";
import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactElement,
} from "react";

/**
 * The mail server's application / API server ID is resolved server-side from
 * the SCHEMAVAULTS_API_SERVER_ID environment variable (see
 * `src/lib/getAppId.ts`, which is server-only) and threaded to client
 * components through this context from the root layout.
 */
const MailAppIdContext = createContext<ApiServerId | null>(null);

export type MailAppIdProviderProps = PropsWithChildren<{
  app_id: ApiServerId;
}>;

export function MailAppIdProvider({
  app_id,
  children,
}: MailAppIdProviderProps): ReactElement {
  if (!apiServerIdSchema.safeParse(app_id).success) {
    throw new Error("<MailAppIdProvider> received an invalid 'app_id'!");
  }
  return (
    <MailAppIdContext.Provider value={app_id}>
      {children}
    </MailAppIdContext.Provider>
  );
}

export function useMailAppId(): ApiServerId {
  const app_id = useContext(MailAppIdContext);
  if (!app_id) {
    throw new Error(
      "useMailAppId must be used within a <MailAppIdProvider> render tree!",
    );
  }
  return app_id;
}
