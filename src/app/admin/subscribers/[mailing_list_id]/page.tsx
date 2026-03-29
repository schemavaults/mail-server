import "server-only";

import type { ReactElement } from "react";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import type { MailingListSubscriber } from "@/lib/mail-db";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import SubscribersClientView from "./subscribers-client-view";

export default async function SubscribersPage({
  params,
}: {
  params: Promise<{ mailing_list_id: string }>;
}): Promise<ReactElement> {
  const { mailing_list_id } = await params;

  return await withAdminServerComponentRouteGuard(
    async function SubscribersServerComponent({ dbh }): Promise<ReactElement> {
      const mailRegistry = new MailingListRegistry(dbh);

      let subscribers: readonly MailingListSubscriber[] = [];
      let mailingListName: string = mailing_list_id;

      try {
        subscribers = await mailRegistry.listSubscribers(mailing_list_id);

        const mailingLists: readonly MailingListDefinition[] =
          await mailRegistry.listMailingLists();
        const match = mailingLists.find(
          (ml) => ml.mailing_list_id === mailing_list_id,
        );
        if (match) {
          mailingListName = match.name;
        }
      } catch (e: unknown) {
        console.error("Failed to load subscribers: ", e);
      }

      return (
        <SubscribersClientView
          mailing_list_name={mailingListName}
          mailing_list_id={mailing_list_id}
          subscribers={subscribers}
        />
      );
    },
  );
}
