import "server-only";

import type { ReactElement } from "react";
import { MailingListRegistry } from "@/lib/mail-db";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import MailingListsView from "@/components/ListMailingListsPage";
import {
  getAppEnvironment,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import {
  type IAdminServerComponentProps,
  withAdminServerComponentRouteGuard,
} from "@/lib/withAdminRouteGuard";
import { connection } from "next/server";

const environment: SchemaVaultsAppEnvironment = getAppEnvironment();

async function AdminPageWithPreloadedMailingLists({
  dbh,
}: IAdminServerComponentProps): Promise<ReactElement> {
  let mailingLists: readonly MailingListDefinition[];
  try {
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
    { next_href: "/admin/all_mailing_lists" },
  );
}
