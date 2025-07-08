"use client";

import listMailingLists from "@/lib/client-mail-db-actions/listMailingLists";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { cn, LoadingPage, Separator, Wordmark } from "@schemavaults/ui";
import type { ReactElement } from "react";
import useSWR from "swr";
import AvailableMailingLists from "./available-mailing-lists";
import type { SchemaVaultsAppEnvironment } from "@schemavaults/app-definitions";
import getSchemaVaultsCoreWebAppUrl from "@/lib/getSchemaVaultsCoreWebAppUrl";
import PublicPageFooter from "@/components/PublicPageFooter";

export interface MailServerHomepageClientViewProps {
  mailing_lists: readonly MailingListDefinition[];
  environment: SchemaVaultsAppEnvironment;
}

export default function MailServerHomepageClientView({
  environment,
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

  const headerFontSizeClassName: string = "text-xl md:text-2xl";

  return (
    <div
      className={cn(
        "w-full min-h-screen h-full",
        "flex flex-col justify-center items-stretch",
        "bg-background",
      )}
    >
      <header
        className={cn(
          "h-24",
          "flex items-center justify-start gap-2 md:gap-4",
          "p-2 md:p-4",
          "shadow-md",
        )}
      >
        <a href={getSchemaVaultsCoreWebAppUrl(environment)}>
          <h1 className={cn(headerFontSizeClassName)}>
            <Wordmark />
          </h1>
        </a>

        <Separator decorative orientation="vertical" className="h-14" />
        <h2 className={cn(headerFontSizeClassName)}>Mailing Lists</h2>
      </header>
      <Separator decorative orientation="horizontal" className="w-full" />
      <main className="flex flex-col justify-start items-stretch w-full grow flex-nowrap">
        <section
          className={cn(
            "flex w-full grow justify-start items-stretch",
            "py-4 px-4 md:px-8 lg:px-16 xl:px-24",
          )}
        >
          {isSomeDataReady ? (
            <AvailableMailingLists mailing_lists={data} />
          ) : isLoading ? (
            <LoadingPage message="Loading mailing lists..." />
          ) : (
            <AvailableMailingLists mailing_lists={[]} />
          )}
        </section>
      </main>
      <Separator decorative orientation="horizontal" className="w-full" />
      <PublicPageFooter containerClassName="w-full" />
    </div>
  );
}
