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
        <header className="h-24 flex items-center justify-start">
          <h1 className="text-2xl flex flex-row flex-nowrap gap-2">
            <Wordmark />
            <Separator decorative orientation="vertical" className="h-20" />
            <span>Mail Management</span>
          </h1>
        </header>
        <Separator
          decorative
          orientation="horizontal"
          className="w-full mx-2 md:mx-4 lg:mx-8"
        />
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
