"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Badge, Button, cn, useToast } from "@schemavaults/ui";
import {
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";
import { RefreshCw, ScrollText } from "lucide-react";
import { Nav } from "@/components/Nav";
import type {
  EmailSendLogEntry,
  EmailSendLogStatus,
} from "@/lib/mail-db/email-send-log-table";
import { DEFAULT_EMAIL_SEND_LOG_PAGE_SIZE } from "@/app/api/admin/email-send-log/page-size";
import listEmailSendLog from "@/lib/client-mail-db-actions/listEmailSendLog";
import { useMailAppId } from "@/contexts/MailAppIdContext";

export interface EmailSendLogClientViewProps {
  /** The newest page of entries (unfiltered), loaded server-side. */
  initialEntries: readonly EmailSendLogEntry[];
  /** Set when the server failed to load the initial page. */
  loadError: string | null;
}

type StatusFilter = EmailSendLogStatus | "all";

const STATUS_FILTERS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
];

const PAGE_SIZE = DEFAULT_EMAIL_SEND_LOG_PAGE_SIZE;

function formatTimestamp(value: number): string {
  return new Date(value).toLocaleString();
}

function describeSender(entry: EmailSendLogEntry): string {
  if (entry.api_key_id === null) return "an admin or the server";
  return entry.api_key_name !== null
    ? `API key "${entry.api_key_name}"`
    : `API key ${entry.api_key_id}`;
}

/**
 * Appends a later page, skipping entries already shown: offset paging over
 * a newest-first log shifts by one for every send logged in between.
 */
function appendPage(
  current: readonly EmailSendLogEntry[],
  page: readonly EmailSendLogEntry[],
): readonly EmailSendLogEntry[] {
  const seen = new Set(current.map((entry) => entry.email_send_log_id));
  return [
    ...current,
    ...page.filter((entry) => !seen.has(entry.email_send_log_id)),
  ];
}

export default function EmailSendLogClientView({
  initialEntries,
  loadError: initialLoadError,
}: EmailSendLogClientViewProps): ReactElement {
  const { toast } = useToast();
  const auth = useAuth();
  const appId = useMailAppId();
  const [entries, setEntries] =
    useState<readonly EmailSendLogEntry[]>(initialEntries);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [hasMore, setHasMore] = useState<boolean>(
    initialEntries.length === PAGE_SIZE,
  );
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [isLoading, startLoadTransition] = useTransition();

  function getAuthClient(): ISchemaVaultsAuthClient | null {
    if (!auth.ready || !auth.client.current) return null;
    return auth.client.current;
  }

  /**
   * Loads a page for `filter`: from the top (replacing what is shown) for a
   * refresh or a filter change, or after the shown entries for "Load more".
   */
  function loadPage(filter: StatusFilter, mode: "replace" | "append") {
    const authClient = getAuthClient();
    if (!authClient) {
      toast({
        variant: "destructive",
        title: "Auth not ready",
        description: "Auth client is not ready yet — please try again.",
      });
      return;
    }

    startLoadTransition(async () => {
      try {
        const page = await listEmailSendLog(
          {
            limit: PAGE_SIZE,
            offset: mode === "append" ? entries.length : 0,
            status: filter === "all" ? undefined : filter,
          },
          authClient,
          appId,
        );
        setEntries((current) =>
          mode === "append" ? appendPage(current, page) : page,
        );
        setStatusFilter(filter);
        setHasMore(page.length === PAGE_SIZE);
        setLoadError(null);
      } catch (e: unknown) {
        console.error("Failed to load the email send log: ", e);
        toast({
          variant: "destructive",
          title: "Failed to load the email send log",
          description:
            e instanceof Error
              ? e.message
              : "An unknown error occurred while loading the email send log.",
        });
      }
    });
  }

  return (
    <div
      className={cn(
        "w-full min-h-screen h-full",
        "flex flex-col justify-start items-stretch",
        "bg-background",
      )}
    >
      <Nav
        title={
          <>
            <ScrollText className="h-5 w-5 shrink-0" />
            Email Send Log
          </>
        }
        backHref="/admin"
      >
        <Button
          variant="secondary"
          onClick={() => loadPage(statusFilter, "replace")}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </Nav>

      <main className="flex flex-col w-full grow">
        <section className="flex flex-col w-full grow gap-4 py-4 px-4 md:px-8 lg:px-16 xl:px-24">
          <p className="text-sm text-muted-foreground">
            Every outbound send attempt, newest first — from{" "}
            <code className="font-mono">/api/send</code> (including the Send an
            email page) and from the server itself, such as subscription
            confirmation emails. Each entry records only when the email was
            delivered, or the error if it was not; subjects, bodies,
            attachments, and addresses are never logged.{" "}
            <strong>Delivered</strong> means the transport accepted the message
            for delivery; use the message ID to follow it further in the
            provider&apos;s own logs.
          </p>

          <div
            className="flex flex-row flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter by outcome"
          >
            {STATUS_FILTERS.map(({ value, label }) => (
              <Button
                key={value}
                size="sm"
                variant={statusFilter === value ? "default" : "outline"}
                aria-pressed={statusFilter === value}
                disabled={isLoading}
                onClick={() => loadPage(value, "replace")}
              >
                {label}
              </Button>
            ))}
          </div>

          {loadError !== null ? (
            <p className="text-sm text-red-500">{loadError}</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {statusFilter === "all"
                ? "No emails have been sent yet."
                : `No ${statusFilter} send attempts.`}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {entries.map((entry) => (
                <EmailSendLogEntryRow
                  key={entry.email_send_log_id}
                  entry={entry}
                />
              ))}
            </ul>
          )}

          {loadError === null && hasMore ? (
            <Button
              variant="secondary"
              className="self-center"
              onClick={() => loadPage(statusFilter, "append")}
              disabled={isLoading}
            >
              {isLoading ? "Loading…" : "Load more"}
            </Button>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function EmailSendLogEntryRow({
  entry,
}: {
  entry: EmailSendLogEntry;
}): ReactElement {
  const delivered = entry.status === "delivered";
  return (
    <li className="w-full p-3 md:p-4 flex flex-col gap-1 border rounded-md bg-card shadow-sm">
      <div className="flex flex-row flex-wrap items-center gap-2">
        {delivered ? (
          <Badge
            variant="outline"
            className="text-green-600 dark:text-green-500"
          >
            Delivered
          </Badge>
        ) : (
          <Badge variant="destructive">Failed</Badge>
        )}
        <p className="text-sm font-medium text-foreground">
          {formatTimestamp(entry.delivered_at ?? entry.attempted_at)}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Via{" "}
        <span className="font-mono">
          {entry.transport ?? "unknown transport"}
        </span>{" "}
        · Sent by {describeSender(entry)}
        {entry.delivered_at !== null
          ? ` · Took ${entry.delivered_at - entry.attempted_at} ms`
          : null}
      </p>
      {entry.provider_message_id !== null ? (
        <p className="text-xs font-mono text-muted-foreground break-all">
          Message ID: {entry.provider_message_id}
        </p>
      ) : null}
      {entry.error_message !== null ? (
        <p className="text-xs text-destructive whitespace-pre-wrap break-words">
          {entry.error_message}
        </p>
      ) : null}
    </li>
  );
}
