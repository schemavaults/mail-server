import { z } from "@/lib/zod-openapi";
import { MAIL_TRANSPORT_KINDS } from "@/lib/mail-transport/loadMailTransportConfig";

// Aggregated email send statistics: EMAIL_SEND_LOG attempts counted per
// transport and time bucket, as served by GET /api/admin/email-send-stats
// and charted at /admin/email-traffic. Client-safe (no server-only imports)
// so the page shares the schemas, granularities and limits with the route.

/** Bucket sizes the stats can be grouped by (Postgres `date_trunc` units). */
export const EMAIL_SEND_STATS_GRANULARITIES = [
  "hour",
  "day",
  "week",
  "month",
] as const;
export type EmailSendStatsGranularity =
  (typeof EMAIL_SEND_STATS_GRANULARITIES)[number];

/**
 * Most buckets one stats request may span: enough for a month of hourly
 * buckets (744) or two years of daily ones (730).
 */
export const MAX_EMAIL_SEND_STATS_BUCKETS = 750;

/** The shortest a bucket of each granularity can be, in milliseconds. */
const MIN_BUCKET_MS: Record<EmailSendStatsGranularity, number> = {
  hour: 60 * 60 * 1000,
  // A local day can be 23 hours long (DST); a month as short as 28 days.
  day: 23 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000,
  month: 28 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000,
};

/**
 * Upper bound on how many buckets `[from, to)` spans at `granularity`
 * (partial buckets at either end included), so a request can be refused
 * before querying when it would exceed MAX_EMAIL_SEND_STATS_BUCKETS.
 */
export function estimateEmailSendStatsBucketCount(
  from: number,
  to: number,
  granularity: EmailSendStatsGranularity,
): number {
  if (!(to > from)) return 0;
  return Math.ceil((to - from) / MIN_BUCKET_MS[granularity]) + 1;
}

/**
 * Display order for transports: the known transports in registry order,
 * then any other logged transport id alphabetically, then attempts that
 * resolved no transport (null) last.
 */
export function compareEmailSendStatsTransports(
  a: string | null,
  b: string | null,
): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const known: readonly string[] = MAIL_TRANSPORT_KINDS;
  const ai = known.indexOf(a);
  const bi = known.indexOf(b);
  if (ai !== -1 || bi !== -1) {
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  }
  return a < b ? -1 : 1;
}

export const emailSendStatsGranularitySchema = z
  .enum(EMAIL_SEND_STATS_GRANULARITIES)
  .openapi("EmailSendStatsGranularity", {
    description:
      "How send attempts are grouped over time: by `hour`, `day`, `week` (starting Monday), or `month`, in the requested time zone.",
  });

export const emailSendStatsTransportCountsSchema = z
  .object({
    transport: z.string().nullable().openapi({
      description:
        "The transport the attempts were dispatched through, or null for attempts that resolved no transport (e.g. a misconfigured MAIL_TRANSPORT).",
      example: "resend",
    }),
    delivered: z.number().int().nonnegative().openapi({
      description: "Attempts the transport accepted for delivery.",
    }),
    failed: z.number().int().nonnegative().openapi({
      description: "Attempts that failed.",
    }),
  })
  .openapi("EmailSendStatsTransportCounts", {
    description:
      "Send attempts through one transport, by outcome. Attempts = delivered + failed.",
  });

export const emailSendStatsBucketSchema = z
  .object({
    bucket_start: z.number().openapi({
      description:
        "Unix epoch milliseconds when the bucket starts (local midnight for daily buckets, in the requested time zone). The first bucket may start before `from`.",
    }),
    transports: z.array(emailSendStatsTransportCountsSchema).openapi({
      description:
        "Counts per transport within the bucket; transports without attempts in it are omitted.",
    }),
  })
  .openapi("EmailSendStatsBucket");

export const emailSendStatsSchema = z
  .object({
    from: z.number().openapi({
      description: "Start of the range (inclusive), Unix epoch milliseconds.",
    }),
    to: z.number().openapi({
      description: "End of the range (exclusive), Unix epoch milliseconds.",
    }),
    timezone: z.string().openapi({
      description: "The IANA time zone buckets were aligned to.",
      example: "UTC",
    }),
    granularity: emailSendStatsGranularitySchema,
    totals: z.array(emailSendStatsTransportCountsSchema).openapi({
      description:
        "Counts per transport over the whole range; transports without attempts in range are omitted.",
    }),
    buckets: z.array(emailSendStatsBucketSchema).openapi({
      description:
        "Every bucket overlapping the range, oldest first — including empty ones, so the series has no gaps.",
    }),
  })
  .openapi("EmailSendStats", {
    description:
      "Outbound send attempts from the email send log, counted per transport and time bucket. Counts only — no message content.",
  });

export type EmailSendStatsTransportCounts = z.infer<
  typeof emailSendStatsTransportCountsSchema
>;
export type EmailSendStatsBucket = z.infer<typeof emailSendStatsBucketSchema>;
export type EmailSendStats = z.infer<typeof emailSendStatsSchema>;
