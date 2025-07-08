"use client";

import { FixedBackButton } from "@/components/FixedBackButton";
import { LoadingPage, useToast } from "@schemavaults/ui";
import { useStartLoginOauthPKCEFlow } from "@schemavaults/auth-react-provider";
import { type ReactElement } from "react";
import { useRouter } from "next/navigation";
import checkIfAuthenticatedWithServerWithRefreshToken from "@/lib/checkIfAuthenticatedWithServerWithRefreshToken";

export default function LoginPage(): ReactElement {
  useStartLoginOauthPKCEFlow(
    useRouter,
    checkIfAuthenticatedWithServerWithRefreshToken,
    useToast,
  );

  return (
    <>
      <FixedBackButton href="/" />
      <LoadingPage message="Commencing login flow..." />
    </>
  );
}
