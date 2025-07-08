"use client";

import listMailingLists from "@/lib/client-mail-db-actions/listMailingLists";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { LoadingPage, Separator, Wordmark } from "@schemavaults/ui";
import type { ReactElement } from "react";
import useSWR from "swr";
import AvailableMailingLists from "./available-mailing-lists";

export interface MailServerHomepageClientViewProps {
  mailing_lists: readonly MailingListDefinition[];
}

export default function MailServerHomepageClientView({
  mailing_lists,
}: MailServerHomepageClientViewProps): ReactElement {
  const { data, error, isLoading } = useSWR(
    `/api/mailing_lists`,
    async (): Promise<readonly MailingListDefinition[]> => {
      return await listMailingLists();
    },
    {
      fallbackData: mailing_lists,
    },
  );

  const isSomeDataReady = data;

  return (
    <div className="w-full min-h-screen h-full flex justify-center items-stretch bg-background py-4 px-4 md:px-8 lg:px-16 xl:px-24">
      <main className="flex flex-col justify-start items-stretch w-full h-full min-h-screen flex-nowrap">
        <header className="h-18 flex items-center justify-start">
          <h1 className="text-2xl">
            <Wordmark />
          </h1>
          <Separator decorative orientation="vertical" className="h-14" />
          <h2 className="text-2xl">Mailing Lists</h2>
        </header>
        <Separator decorative orientation="horizontal" className="w-full" />
        {isSomeDataReady ? (
          <AvailableMailingLists mailing_lists={data} />
        ) : isLoading ? (
          <LoadingPage message="Loading mailing lists..." />
        ) : (
          <AvailableMailingLists mailing_lists={[]} />
        )}
      </main>
    </div>
  );
}
