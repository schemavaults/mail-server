"use client";

import type { PropsWithChildren, ReactElement } from "react";
import AuthProvider from "./auth/auth-provider";
import {
  schemaVaultsAppEnvironmentSchema,
  type ApiServerId,
  type AppId,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import { getDebugState } from "@/lib/getDebugState";
import { MailAppIdProvider } from "@/contexts/MailAppIdContext";
import { CoreWebAppUrlProvider } from "@/contexts/CoreWebAppUrlContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import type { BrandConfig } from "@/lib/branding";

export interface ClientAppLogicProvidersProps extends PropsWithChildren {
  environment: SchemaVaultsAppEnvironment;
  /** Resolved server-side by getAppId() and passed down from the root layout. */
  app_id: ApiServerId;
  /** Resolved server-side by getSchemaVaultsAuthServerUrl() and passed down from the root layout. */
  auth_server_url: string;
  /**
   * White-label brand configuration, resolved server-side from BRAND_*
   * environment variables in the root layout.
   */
  branding: BrandConfig;
}

export function ClientAppLogicProviders({
  environment,
  app_id,
  auth_server_url,
  branding,
  children,
}: ClientAppLogicProvidersProps): ReactElement {
  const debug: boolean = getDebugState(environment);

  if (!schemaVaultsAppEnvironmentSchema.safeParse(environment).success) {
    throw new Error(
      "@schemavaults/mail-server auth provider received an invalid 'environment' to run in!",
    );
  }

  return (
    <BrandingProvider branding={branding}>
      <CoreWebAppUrlProvider url={branding.url}>
        <MailAppIdProvider app_id={app_id}>
          <AuthProvider
            app_id={app_id}
            auth_server_url={auth_server_url}
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
    </BrandingProvider>
  );
}
