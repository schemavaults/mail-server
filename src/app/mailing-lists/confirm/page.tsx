import type { ReactElement } from "react";
import ConfirmSubscriptionClient from "./ConfirmSubscriptionClient";

interface ConfirmSubscriptionPageProps {
  searchParams: Promise<{
    token?: string | string[];
    email?: string | string[];
  }>;
}

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

export default async function ConfirmSubscriptionPage(
  props: ConfirmSubscriptionPageProps,
): Promise<ReactElement> {
  const searchParams = await props.searchParams;
  const token = firstParam(searchParams.token);
  const email = firstParam(searchParams.email);

  return <ConfirmSubscriptionClient token={token} email={email} />;
}
