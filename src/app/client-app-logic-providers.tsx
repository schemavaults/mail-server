"use client";

import type { PropsWithChildren, ReactElement } from "react";
import AuthProvider, {
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/auth-react-provider";
import { usePathname, useRouter } from "next/navigation";
import { getAppId } from "@/lib/getAppId";
import useDebug from "@/hooks/useDebug";
import {
  schemaVaultsAppEnvironmentSchema,
  type AppId,
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
      authed_on_unauthed_redirect_uri="/account"
      unauthed_on_authed_redirect_uri="/auth/login"
      router={router}
      path={path}
      default_audiences={[SCHEMAVAULTS_MAIL_APP_ID] as const satisfies AppId[]}
      debug={debug}
      environment={environment}
    >
      {children}
    </AuthProvider>
  );
}
