"use client";

import { useMemo, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FixedBackButton } from "@/components/FixedBackButton";
import { LoadingPage, useToast } from "@schemavaults/ui";
import {
  type ISchemaVaultsAuthClient,
  type SchemaVaultsAppEnvironment,
  useAppEnvironment,
  useAuth,
  useTradeAuthorizationCodeForTokensEffect,
} from "@schemavaults/auth-react-provider";
import { getDebugState } from "@/lib/getDebugState";

interface ExchangeAuthCodeForTokensManagerComponentProps {
  auth: ISchemaVaultsAuthClient;
}

const backHref = "/";

function ExchangeAuthCodeForTokensManagerComponent({
  auth,
}: ExchangeAuthCodeForTokensManagerComponentProps): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const environment: SchemaVaultsAppEnvironment = useAppEnvironment();
  const debug: boolean = useMemo(
    (): boolean => getDebugState(environment),
    [environment],
  );
  useTradeAuthorizationCodeForTokensEffect({
    router,
    searchParams,
    auth,
    toast,
    debug,
  });

  return (
    <>
      <FixedBackButton href={backHref} />
      <LoadingPage message="Trading authorization code & proof code for tokens..." />
    </>
  );
}

export default function AuthorizePage(): ReactElement {
  const auth = useAuth();

  if (!auth || !auth.ready || !auth.client || !auth.client.current) {
    return (
      <>
        <FixedBackButton href={backHref} />
        <LoadingPage message="Loading auth client..." />
      </>
    );
  }

  const authClient: ISchemaVaultsAuthClient = auth.client.current;

  return <ExchangeAuthCodeForTokensManagerComponent auth={authClient} />;
}
