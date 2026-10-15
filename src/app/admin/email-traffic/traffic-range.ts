import {
  EMAIL_SEND_STATS_GRANULARITIES,
  estimateEmailSendStatsBucketCount,
  MAX_EMAIL_SEND_STATS_BUCKETS,
  type EmailSendStatsGranularity,
} from "@/lib/mail-db/email-send-stats";

// The date range the /admin/email-traffic page charts: a preset relative to
// now, or a custom span of whole days. Ranges are computed in the browser's
// local time, the same time zone the page asks the stats API to align its
// buckets to, so "Last 7 days" runs from local midnight to local midnight.

export const TRAFFIC_RANGE_PRESETS = [
  { id: "24h", label: "24 hours" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "12m", label: "12 months" },
] as const;
export type TrafficRangePresetId = (typeof TRAFFIC_RANGE_PRESETS)[number]["id"];

export const DEFAULT_TRAFFIC_RANGE_PRESET: TrafficRangePresetId = "30d";

export interface TrafficRange {
  /** The preset the range was picked from, or "custom" for picked days. */
  preset: TrafficRangePresetId | "custom";
  /** Start of the range (inclusive), epoch milliseconds. */
  from: number;
  /** End of the range (exclusive), epoch milliseconds. */
  to: number;
  granularity: EmailSendStatsGranularity;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function startOfLocalDay(date: Date, offsetDays = 0): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + offsetDays,
  );
}

/** The range a preset covers as of `now`, with the preset's granularity. */
export function presetTrafficRange(
  preset: TrafficRangePresetId,
  now: Date,
): TrafficRange {
  switch (preset) {
    case "24h": {
      // The current hour and the 23 before it.
      const nextHour = new Date(now);
      nextHour.setMinutes(0, 0, 0);
      nextHour.setHours(nextHour.getHours() + 1);
      const to = nextHour.getTime();
      return { preset, from: to - 24 * HOUR_MS, to, granularity: "hour" };
    }
    case "7d":
    case "30d":
    case "90d": {
      // Today and the days before it, whole local days.
      const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
      return {
        preset,
        from: startOfLocalDay(now, 1 - days).getTime(),
        to: startOfLocalDay(now, 1).getTime(),
        granularity: "day",
      };
    }
    case "12m": {
      // This month and the 11 before it.
      return {
        preset,
        from: new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime(),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime(),
        granularity: "month",
      };
    }
  }
}

/** Whether `granularity` keeps `[from, to)` within the API's bucket cap. */
export function isGranularityAllowed(
  from: number,
  to: number,
  granularity: EmailSendStatsGranularity,
): boolean {
  return (
    estimateEmailSendStatsBucketCount(from, to, granularity) <=
    MAX_EMAIL_SEND_STATS_BUCKETS
  );
}

/**
 * A readable bucket size for `[from, to)`: hourly up to two days, daily up
 * to about three months, weekly up to about 18 months, monthly beyond —
 * coarsened further if the bucket cap would otherwise be exceeded.
 */
export function autoTrafficGranularity(
  from: number,
  to: number,
): EmailSendStatsGranularity {
  const span = to - from;
  const preferred: EmailSendStatsGranularity =
    span <= 2 * DAY_MS + HOUR_MS
      ? "hour"
      : span <= 92 * DAY_MS
        ? "day"
        : span <= 550 * DAY_MS
          ? "week"
          : "month";
  const coarser = EMAIL_SEND_STATS_GRANULARITIES.slice(
    EMAIL_SEND_STATS_GRANULARITIES.indexOf(preferred),
  );
  return (
    coarser.find((granularity) =>
      isGranularityAllowed(from, to, granularity),
    ) ?? "month"
  );
}

/**
 * The range of whole local days `first`…`last` (both inclusive, in either
 * order), with an automatically picked granularity.
 */
export function customTrafficRange(first: Date, last: Date): TrafficRange {
  const [start, end] = first <= last ? [first, last] : [last, first];
  const from = startOfLocalDay(start).getTime();
  const to = startOfLocalDay(end, 1).getTime();
  return {
    preset: "custom",
    from,
    to,
    granularity: autoTrafficGranularity(from, to),
  };
}

/** The last day a range covers: the local day before its exclusive end. */
export function lastDayOfTrafficRange(range: TrafficRange): Date {
  return new Date(range.to - 1);
}
