import "server-only";

import type { ReactElement } from "react";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { loadTransportStatuses } from "@/app/api/admin/transports/load-transport-statuses";
import type { TransportStatus } from "@/app/api/admin/transports/transport-status-schema";
import { connection } from "next/server";
import EmailTrafficClientView from "./email-traffic-client-view";

/**
 * Email traffic per transport: send attempts from the email send log over
 * a chosen date range, as stat tiles, a stacked bar chart over time, share
 * pie charts, and per-transport totals. The counts are loaded in the
 * browser (GET /api/admin/email-send-stats) so buckets align to the
 * admin's own time zone; only the transport statuses load here.
 */
export default async function AdminEmailTrafficPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminEmailTrafficServerComponent({
      dbh,
    }): Promise<ReactElement> {
      let transports: TransportStatus[] = [];
      let transportsError: string | null = null;
      try {
        transports = await loadTransportStatuses(dbh);
      } catch (e: unknown) {
        console.error("Failed to resolve mail transport availability: ", e);
        transportsError =
          e instanceof Error
            ? e.message
            : "Failed to resolve mail transport availability!";
      }

      return (
        <EmailTrafficClientView
          transports={transports}
          transportsError={transportsError}
        />
      );
    },
  );
}
