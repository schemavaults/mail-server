"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Button, cn, useToast } from "@schemavaults/ui";
import {
  useAuth,
  type ISchemaVaultsAuthClient,
} from "@schemavaults/auth-react-provider";
import { Nav } from "@/components/Nav";
import type { TransportStatus } from "@/app/api/admin/transports/transport-status-schema";
import {
  TEST_DATABASE_MAIL_TRANSPORT,
  type MailTransportKind,
} from "@/lib/mail-transport/loadMailTransportConfig";
import listTransports from "@/lib/client-mail-db-actions/listTransports";
import setTransportEnabled from "@/lib/client-mail-db-actions/setTransportEnabled";
import { useMailAppId } from "@/contexts/MailAppIdContext";

export interface TransportsClientViewProps {
  initialTransports: readonly TransportStatus[];
  /** Set when the server failed to resolve transport availability. */
  configError: string | null;
}

const TRANSPORT_DESCRIPTIONS: Record<MailTransportKind, string> = {
  resend: "Resend API (configured via RESEND_API_KEY)",
  smtp: "Raw SMTP relay via nodemailer (configured via SMTP_*)",
  "test-database-transport":
    "Fake sending for E2E tests: stores emails in the database instead of delivering them (configured via TEST_DATABASE_MAIL_TRANSPORT_ENABLED; readable at /api/test-emails)",
};

export default function TransportsClientView({
  initialTransports,
  configError,
}: TransportsClientViewProps): ReactElement {
  const { toast } = useToast();
  const auth = useAuth();
  const appId = useMailAppId();
  const [transports, setTransports] =
    useState<readonly TransportStatus[]>(initialTransports);
  const [isToggling, startToggleTransition] = useTransition();

  function getAuthClient(): ISchemaVaultsAuthClient | null {
    if (!auth.ready || !auth.client.current) return null;
    return auth.client.current;
  }

  function handleToggle(row: TransportStatus) {
    const authClient = getAuthClient();
    if (!authClient) {
      toast({
        variant: "destructive",
        title: "Auth not ready",
        description: "Auth client is not ready yet — please try again.",
      });
      return;
    }
    const nextEnabled = !row.enabled;

    startToggleTransition(async () => {
      try {
        await setTransportEnabled(row.id, nextEnabled, authClient, appId);
        toast({
          title: nextEnabled ? "Transport enabled" : "Transport disabled",
          description: nextEnabled
            ? `Sends through '${row.id}' are allowed again.`
            : `Sends through '${row.id}' are now rejected until it is re-enabled.`,
        });
        try {
          setTransports(await listTransports(authClient, appId));
        } catch (e: unknown) {
          console.error("Failed to refresh mail transports: ", e);
        }
      } catch (e: unknown) {
        console.error("Failed to update mail transport: ", e);
        toast({
          variant: "destructive",
          title: "Failed to update transport",
          description:
            e instanceof Error
              ? e.message
              : "An unknown error occurred while updating the transport.",
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
      <Nav title="Mail Transports" backHref="/admin" />
      <main className="flex flex-col w-full grow">
        <section className="flex flex-col w-full grow gap-4 py-4 px-4 md:px-8 lg:px-16 xl:px-24">
          <p className="text-sm text-muted-foreground">
            Outbound mail transports available on this deployment. A transport
            is configured when its environment variables are present; the
            default transport (selected by{" "}
            <code className="font-mono">MAIL_TRANSPORT</code>) is used when a
            send request does not specify a{" "}
            <code className="font-mono">transport</code>. API keys can be
            restricted to specific transports from the API Keys page. The
            fake-send{" "}
            <code className="font-mono">{TEST_DATABASE_MAIL_TRANSPORT}</code>{" "}
            can additionally be disabled here so it is never usable by real
            traffic.
          </p>

          {configError !== null ? (
            <p className="text-sm text-red-500">{configError}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {transports.map((row) => (
                <li
                  key={row.id}
                  className="w-full p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-2 md:justify-between border rounded-md bg-card shadow-sm"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium font-mono text-foreground">
                      {row.id}
                      {row.is_default ? (
                        <span className="ml-2 text-xs font-sans text-muted-foreground">
                          (default)
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {TRANSPORT_DESCRIPTIONS[row.id]}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-3">
                    <p
                      className={
                        row.configured && row.enabled
                          ? "text-sm font-medium text-green-600 dark:text-green-500"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {!row.configured
                        ? "Not configured"
                        : row.enabled
                          ? "Configured"
                          : "Disabled by admin"}
                    </p>
                    {row.id === TEST_DATABASE_MAIL_TRANSPORT ? (
                      <Button
                        variant={row.enabled ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggle(row)}
                        disabled={isToggling}
                        aria-label={
                          row.enabled
                            ? `Disable the ${row.id} transport`
                            : `Enable the ${row.id} transport`
                        }
                      >
                        {isToggling
                          ? "Saving…"
                          : row.enabled
                            ? "Disable"
                            : "Enable"}
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
