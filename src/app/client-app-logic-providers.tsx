"use client";

import type { PropsWithChildren, ReactElement } from "react";
import AuthProvider from "./auth/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import {
  schemaVaultsAppEnvironmentSchema,
  type ApiServerId,
  type AppId,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import { getDebugState } from "@/lib/getDebugState";
import { MailAppIdProvider } from "@/contexts/MailAppIdContext";
import { CoreWebAppUrlProvider } from "@/contexts/CoreWebAppUrlContext";

export interface ClientAppLogicProvidersProps extends PropsWithChildren {
  environment: SchemaVaultsAppEnvironment;
  /** Resolved server-side by getAppId() and passed down from the root layout. */
  app_id: ApiServerId;
  /** Resolved server-side from SCHEMAVAULTS_WEB_APP_URL in the root layout. */
  core_web_app_url: string;
}

export function ClientAppLogicProviders({
  environment,
  app_id,
  core_web_app_url,
  children,
}: ClientAppLogicProvidersProps): ReactElement {
  const router = useRouter();
  const path: string = usePathname();
  const debug: boolean = getDebugState(environment);

  if (!schemaVaultsAppEnvironmentSchema.safeParse(environment).success) {
    throw new Error(
      "@schemavaults/mail-server auth provider received an invalid 'environment' to run in!",
    );
  }

  return (
    <CoreWebAppUrlProvider url={core_web_app_url}>
      <MailAppIdProvider app_id={app_id}>
        <AuthProvider
          app_id={app_id}
          authed_on_unauthed_redirect_uri="/"
          unauthed_on_authed_redirect_uri="/auth/login"
          default_audiences={[app_id] as const satisfies AppId[]}
          debug={debug}
          environment={environment}
          successful_logout_redirect_uri="/"
          successful_authentication_redirect_uri="/"
          autoreacquire_access_tokens
          authorize_uri="/auth/authorize"
          authMiddlewareRules={(defaultAuthMiddlewareRules) => ({
            ...defaultAuthMiddlewareRules,
            api: [...defaultAuthMiddlewareRules["api"], ["api"]],
            admin: [...defaultAuthMiddlewareRules["admin"], ["admin"]],
          })}
        >
          {children}
        </AuthProvider>
      </MailAppIdProvider>
    </CoreWebAppUrlProvider>
  );
}
