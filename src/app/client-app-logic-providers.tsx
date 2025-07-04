"use client";

import type { PropsWithChildren, ReactElement } from "react";
import AuthProvider from "@schemavaults/auth-react-provider";
import { usePathname, useRouter } from "next/navigation";
import { getAppId } from "@/lib/getAppId";
import useDebug from "@/hooks/useDebug";

const SCHEMAVAULTS_MAIL_APP_ID = getAppId();

export interface ClientAppLogicProvidersProps extends PropsWithChildren {}

export function ClientAppLogicProviders({
  children,
}: ClientAppLogicProvidersProps): ReactElement {
  const router = useRouter();
  const path: string = usePathname();
  // const environment: SchemaVaultsAppEnvironment = useAppEnvironment();
  const debug: boolean = useDebug();

  if (!process.env.NEXT_PUBLIC_SCHEMAVAULTS_APP_ENVIRONMENT) {
    throw new Error(
      "Expected environment variable 'NEXT_PUBLIC_SCHEMAVAULTS_APP_ENVIRONMENT' to be defined!",
    );
  }

  return (
    <AuthProvider
      app_id={SCHEMAVAULTS_MAIL_APP_ID}
      authed_on_unauthed_redirect_uri="/account"
      unauthed_on_authed_redirect_uri="/auth/login"
      router={router}
      path={path}
      default_audiences={[SCHEMAVAULTS_MAIL_APP_ID]}
      debug={debug}
    >
      {children}
    </AuthProvider>
  );
}
