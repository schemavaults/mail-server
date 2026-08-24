import "server-only";

import type { ReactElement } from "react";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import {
  loadMailTransportsAvailability,
  MAIL_TRANSPORT_KINDS,
  type MailTransportKind,
} from "@/lib/mail-transport";
import { Nav } from "@/components/Nav";
import { connection } from "next/server";

interface TransportRow {
  id: MailTransportKind;
  configured: boolean;
  is_default: boolean;
}

const TRANSPORT_DESCRIPTIONS: Record<MailTransportKind, string> = {
  resend: "Resend API (configured via RESEND_API_KEY)",
  smtp: "Raw SMTP relay via nodemailer (configured via SMTP_*)",
};

/**
 * Read-only status page listing the mail transports this deployment knows
 * about: whether each is configured (its env vars are present) and which one
 * is the default per MAIL_TRANSPORT. Credentials are never rendered.
 */
export default async function AdminTransportsPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminTransportsServerComponent(): Promise<ReactElement> {
      let rows: TransportRow[] = [];
      let configError: string | null = null;
      try {
        const availability = loadMailTransportsAvailability();
        rows = MAIL_TRANSPORT_KINDS.map((id) => ({
          id,
          configured: availability.configured.includes(id),
          is_default: availability.defaultTransport === id,
        }));
      } catch (e: unknown) {
        console.error("Failed to resolve mail transport availability: ", e);
        configError =
          e instanceof Error
            ? e.message
            : "Failed to resolve mail transport availability!";
      }

      return (
        <div className="w-full min-h-screen h-full flex flex-col justify-start items-stretch bg-background">
          <Nav title="Mail Transports" backHref="/admin" />
          <main className="flex flex-col w-full grow">
            <section className="flex flex-col w-full grow gap-4 py-4 px-4 md:px-8 lg:px-16 xl:px-24">
              <p className="text-sm text-muted-foreground">
                Outbound mail transports available on this deployment. A
                transport is configured when its environment variables are
                present; the default transport (selected by{" "}
                <code className="font-mono">MAIL_TRANSPORT</code>) is used
                when a send request does not specify a{" "}
                <code className="font-mono">transport</code>. API keys can be
                restricted to specific transports from the API Keys page.
              </p>

              {configError !== null ? (
                <p className="text-sm text-red-500">{configError}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {rows.map((row) => (
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
                      <p
                        className={
                          row.configured
                            ? "text-sm font-medium text-green-600 dark:text-green-500"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {row.configured ? "Configured" : "Not configured"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        </div>
      );
    },
  );
}
