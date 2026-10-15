import type { ChartColorId } from "@schemavaults/ui";
import type { TransportStatus } from "@/app/api/admin/transports/transport-status-schema";
import {
  MAIL_TRANSPORT_KINDS,
  isMailTransportKind,
  type MailTransportKind,
} from "@/lib/mail-transport/loadMailTransportConfig";
import {
  compareEmailSendStatsTransports,
  type EmailSendStatsTransportCounts,
} from "@/lib/mail-db/email-send-stats";

// One chart series per transport on the /admin/email-traffic page: every
// configured transport (even without traffic, so an idle transport shows
// as 0%) plus any transport that has logged attempts in range (e.g. one
// that has since been unconfigured), and the attempts that resolved no
// transport at all.

/** Series id for attempts that resolved no transport (`transport: null`). */
export const NO_TRANSPORT_SERIES_ID = "__no_transport__";

const TRANSPORT_LABELS: Record<MailTransportKind, string> = {
  resend: "Resend",
  smtp: "SMTP",
  "test-database-transport": "Test database",
};

const SERIES_SLOTS = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
  "chart-8",
] as const satisfies readonly ChartColorId[];

export interface TrafficSeries {
  /** Stable id: the transport id, or NO_TRANSPORT_SERIES_ID. */
  id: string;
  transport: string | null;
  label: string;
  colorId: ChartColorId;
  /** Whether the transport's env vars are set on this deployment. */
  configured: boolean;
  /** Whether MAIL_TRANSPORT selects this transport by default. */
  isDefault: boolean;
}

export interface TrafficCounts {
  delivered: number;
  failed: number;
}

export function trafficSeriesIdOf(transport: string | null): string {
  return transport ?? NO_TRANSPORT_SERIES_ID;
}

export function trafficSeriesLabelOf(transport: string | null): string {
  if (transport === null) return "No transport";
  return isMailTransportKind(transport) ? TRANSPORT_LABELS[transport] : transport;
}

/**
 * Builds the series to chart, in display order. Colours follow the
 * transport, never its position in the list: each known transport keeps
 * its registry slot whether or not the others are shown, unknown logged
 * transports take the slots after them, and "no transport" is grey.
 */
export function buildTrafficSeries(
  transports: readonly TransportStatus[],
  totals: readonly EmailSendStatsTransportCounts[],
): TrafficSeries[] {
  const statusById = new Map(transports.map((row) => [row.id, row]));
  const shown = new Set<string | null>(
    transports.filter((row) => row.configured).map((row) => row.id),
  );
  for (const counts of totals) shown.add(counts.transport);

  const unknownIds = [...shown]
    .filter(
      (id): id is string => id !== null && !isMailTransportKind(id),
    )
    .sort(compareEmailSendStatsTransports);
  const slotOrder: readonly string[] = [...MAIL_TRANSPORT_KINDS, ...unknownIds];

  return [...shown]
    .sort(compareEmailSendStatsTransports)
    .map((transport) => {
      const status =
        transport !== null && isMailTransportKind(transport)
          ? statusById.get(transport)
          : undefined;
      const slot = transport === null ? -1 : slotOrder.indexOf(transport);
      return {
        id: trafficSeriesIdOf(transport),
        transport,
        label: trafficSeriesLabelOf(transport),
        colorId: SERIES_SLOTS[slot] ?? "other",
        configured: status?.configured ?? false,
        isDefault: status?.is_default ?? false,
      };
    });
}

/** Indexes per-transport counts by series id. */
export function countsBySeriesId(
  counts: readonly EmailSendStatsTransportCounts[],
): Map<string, TrafficCounts> {
  return new Map(
    counts.map((entry) => [
      trafficSeriesIdOf(entry.transport),
      { delivered: entry.delivered, failed: entry.failed },
    ]),
  );
}

export function attemptsOf(counts: TrafficCounts | undefined): number {
  return counts === undefined ? 0 : counts.delivered + counts.failed;
}
