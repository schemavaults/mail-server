import "server-only";

import type { ReactElement } from "react";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { loadTransportStatuses } from "@/app/api/admin/transports/load-transport-statuses";
import type { TransportStatus } from "@/app/api/admin/transports/transport-status-schema";
import { connection } from "next/server";
import TransportsClientView from "./transports-client-view";

/**
 * Status page listing the mail transports this deployment knows about:
 * whether each is configured (its env vars are present), which one is the
 * default per MAIL_TRANSPORT, and — for the fake-send
 * test-database-transport — an enable/disable control so admins can make
 * sure real users are not sending through it in production. Credentials are
 * never rendered.
 */
export default async function AdminTransportsPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminTransportsServerComponent({
      dbh,
    }): Promise<ReactElement> {
      let rows: TransportStatus[] = [];
      let configError: string | null = null;
      try {
        rows = await loadTransportStatuses(dbh);
      } catch (e: unknown) {
        console.error("Failed to resolve mail transport availability: ", e);
        configError =
          e instanceof Error
            ? e.message
            : "Failed to resolve mail transport availability!";
      }

      return (
        <TransportsClientView
          initialTransports={rows}
          configError={configError}
        />
      );
    },
  );
}
