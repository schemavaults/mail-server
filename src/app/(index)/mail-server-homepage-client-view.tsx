"use client";

import listMailingLists from "@/lib/client-mail-db-actions/listMailingLists";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { LoadingPage, Wordmark } from "@schemavaults/ui";
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
    <div className="w-full min-h-screen h-full flex justify-center items-center bg-background">
      <main className="flex flex-col items-start">
        <header>
          <h1 className="text-2xl">
            <Wordmark />
            Mail Management App
          </h1>
        </header>
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
