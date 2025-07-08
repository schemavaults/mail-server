import "server-only";

import type { ReactElement } from "react";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import MailServerHomepageClientView from "./mail-server-homepage-client-view";
import {
  getAppEnvironment,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";

const environment: SchemaVaultsAppEnvironment = getAppEnvironment();

async function IndexPage(): Promise<ReactElement> {
  let isAdmin: boolean = false;

  let mailingLists: readonly MailingListDefinition[];
  try {
    await using dbh = ServerlessDatabase.getAsyncResource();
    const mailingListsRegistry = new MailingListRegistry(dbh);
    const mailingListsResult: readonly MailingListDefinition[] =
      await mailingListsRegistry.listMailingLists();
    if (!isAdmin) {
      mailingLists = mailingListsResult.filter(
        (mailingList) => mailingList.public,
      );
    } else {
      mailingLists = mailingListsResult;
    }
  } catch (e: unknown) {
    mailingLists = [];
  }

  return (
    <MailServerHomepageClientView
      mailing_lists={mailingLists}
      environment={environment}
    />
  );
}

export default IndexPage;
