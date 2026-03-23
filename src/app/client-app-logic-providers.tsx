"use client";

import type { PropsWithChildren, ReactElement } from "react";
import AuthProvider from "./auth/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { getAppId } from "@/lib/getAppId";
import {
  schemaVaultsAppEnvironmentSchema,
  type AppId,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import { getDebugState } from "@/lib/getDebugState";

const SCHEMAVAULTS_MAIL_APP_ID = getAppId();

export interface ClientAppLogicProvidersProps extends PropsWithChildren {
  environment: SchemaVaultsAppEnvironment;
}

export function ClientAppLogicProviders({
  environment,
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
    <AuthProvider
      app_id={SCHEMAVAULTS_MAIL_APP_ID}
      authed_on_unauthed_redirect_uri="/"
      unauthed_on_authed_redirect_uri="/auth/login"
      default_audiences={[SCHEMAVAULTS_MAIL_APP_ID] as const satisfies AppId[]}
      debug={debug}
      environment={environment}
      successful_logout_redirect_uri="/"
      successful_authentication_redirect_uri="/"
      autoreacquire_access_tokens
      authorize_uri="/auth/authorize"
    >
      {children}
    </AuthProvider>
  );
}
