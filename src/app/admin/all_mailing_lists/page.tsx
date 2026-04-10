import "server-only";

import type { ReactElement } from "react";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import MailingListsView from "@/components/ListMailingListsPage";
import {
  getAppEnvironment,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import {
  withAdminServerComponentRouteGuard,
  type IBaseProtectedAdminServerComponentPageProps,
} from "@schemavaults/auth-server-sdk";
import { redirect } from "next/navigation";
import { connection } from "next/server";

const environment: SchemaVaultsAppEnvironment = getAppEnvironment();

async function AdminPageWithPreloadedMailingLists({
  user,
}: IBaseProtectedAdminServerComponentPageProps): Promise<ReactElement> {
  if (!user.admin) {
    redirect("/");
  }

  let mailingLists: readonly MailingListDefinition[];
  try {
    await using dbh = ServerlessDatabase.getAsyncResource();
    const mailingListsRegistry = new MailingListRegistry(dbh);
    const mailingListsResult: readonly MailingListDefinition[] =
      await mailingListsRegistry.listMailingLists("all");
    mailingLists = mailingListsResult;
  } catch (e: unknown) {
    console.error("Failed to preload all mailing lists for admin page: ", e);
    mailingLists = [];
  }

  return (
    <MailingListsView
      mailing_lists={mailingLists}
      environment={environment}
      isAdminPage
    />
  );
}

export default async function AdminPage() {
  await connection();
  return await withAdminServerComponentRouteGuard(
    AdminPageWithPreloadedMailingLists,
  );
}
