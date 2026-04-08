"use client";

import listMailingLists from "@/lib/client-mail-db-actions/listMailingLists";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { cn, LoadingPage, Separator, Wordmark } from "@schemavaults/ui";
import { useState, type ReactElement } from "react";
import useSWR from "swr";
import AvailableMailingLists from "./available-mailing-lists";
import {
  SCHEMAVAULTS_MAIL_SERVER,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import getSchemaVaultsCoreWebAppUrl from "@/lib/getSchemaVaultsCoreWebAppUrl";
import PublicPageFooter from "@/components/PublicPageFooter";
import {
  SelectedMailingListToJoinContext,
  SelectMailingListToJoinDispatchContext,
} from "@/contexts/SelectedMailingListToJoinContext";
import {
  useAdmin,
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";
import { AdminLinksSection } from "@/components/AdminLinksSection";

export interface ListMailingListsPageProps {
  mailing_lists: readonly MailingListDefinition[];
  environment: SchemaVaultsAppEnvironment;
  isAdminPage?: boolean;
}

export function ListMailingListsPage({
  environment,
  mailing_lists,
  isAdminPage,
}: ListMailingListsPageProps): ReactElement {
  const authContext = useAuth();
  const admin: boolean = useAdmin();

  const query_type = isAdminPage ? "all" : "public";
  const { data, error, isLoading } = useSWR(
    query_type !== "public"
      ? authContext.ready
        ? `/api/mailing_lists`
        : null
      : `/api/mailing_lists`,
    async (): Promise<readonly MailingListDefinition[]> => {
      async function getToken(): Promise<string> {
        if (
          authContext.ready &&
          authContext.client &&
          authContext.client.current
        ) {
          const auth: ISchemaVaultsAuthClient = authContext.client.current;
          const token = await auth.acquireAccessToken({
            audience: SCHEMAVAULTS_MAIL_SERVER.api_server_id,
          });
          return token.token;
        }
        throw new Error(
          "Auth context is not ready! Not attempting to refresh yet",
        );
      }
      return await listMailingLists(
        query_type,
        query_type === "public" ? undefined : await getToken(),
      );
    },
    {
      fallbackData: mailing_lists,
    },
  );

  const isSomeDataReady = data;

  const headerFontSizeClassName: string = "text-xl md:text-2xl";
  const [selectedMailingList, setSelectedMailingList] =
    useState<MailingListDefinition | null>(null);

  return (
    <SelectMailingListToJoinDispatchContext.Provider
      value={setSelectedMailingList}
    >
      <SelectedMailingListToJoinContext.Provider value={selectedMailingList}>
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
            {admin && !isAdminPage && (
              <AdminLinksSection renderLocation={"homepage"} />
            )}
          </main>
          <Separator decorative orientation="horizontal" className="w-full" />
          <PublicPageFooter containerClassName="w-full" />
        </div>
      </SelectedMailingListToJoinContext.Provider>
    </SelectMailingListToJoinDispatchContext.Provider>
  );
}

export default ListMailingListsPage;
