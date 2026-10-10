import "server-only";

import type { ReactElement } from "react";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { EmailSendLogRegistry, type EmailSendLogEntry } from "@/lib/mail-db";
import { DEFAULT_EMAIL_SEND_LOG_PAGE_SIZE } from "@/app/api/admin/email-send-log/page-size";
import { connection } from "next/server";
import EmailSendLogClientView from "./email-send-log-client-view";

/**
 * The email send log: every outbound send attempt, newest first, showing
 * when each email was delivered or why it failed. The log never holds
 * message content, so none is rendered.
 */
export default async function AdminEmailSendLogPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminEmailSendLogServerComponent({
      dbh,
    }): Promise<ReactElement> {
      let entries: readonly EmailSendLogEntry[] = [];
      let loadError: string | null = null;
      try {
        const registry = new EmailSendLogRegistry(dbh);
        entries = await registry.listEntries({
          limit: DEFAULT_EMAIL_SEND_LOG_PAGE_SIZE,
          offset: 0,
        });
      } catch (e: unknown) {
        console.error("Failed to preload the email send log: ", e);
        loadError = "Failed to load the email send log!";
      }

      return (
        <EmailSendLogClientView
          initialEntries={entries}
          loadError={loadError}
        />
      );
    },
  );
}
