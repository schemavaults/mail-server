"use client";

import { FixedBackButton } from "@/components/FixedBackButton";
import { LoadingPage, useToast } from "@schemavaults/ui";
import { useStartRegisterOauthPKCEFlow } from "@schemavaults/auth-react-provider";
import { type ReactElement } from "react";
import { useRouter } from "next/navigation";
import checkIfAuthenticatedWithServerWithRefreshToken from "@/lib/checkIfAuthenticatedWithServerWithRefreshToken";

export default function RegisterPage(): ReactElement {
  useStartRegisterOauthPKCEFlow(
    useRouter,
    checkIfAuthenticatedWithServerWithRefreshToken,
    useToast,
  );

  return (
    <>
      <FixedBackButton href="/" />
      <LoadingPage message="Commencing register flow..." />
    </>
  );
}
