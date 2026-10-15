import {
  EMAIL_SEND_STATS_GRANULARITIES,
  estimateEmailSendStatsBucketCount,
  MAX_EMAIL_SEND_STATS_BUCKETS,
  type EmailSendStatsGranularity,
} from "@/lib/mail-db/email-send-stats";
import {
  addCalendarDays,
  startOfZonedDay,
  wallTimeInZone,
  zonedTimeToEpoch,
  type CalendarDay,
} from "@/lib/time-zone";

// The date range the /admin/email-traffic page charts: a preset relative to
// a moment ("now" when picked), or a custom span of whole calendar days.
// The selection itself is zone-free; it is resolved to instants in the time
// zone the page groups by (the deployment's default, or the viewer's own),
// the same zone the stats API aligns its buckets to, so "Last 7 days" runs
// from local midnight to local midnight there.

export const TRAFFIC_RANGE_PRESETS = [
  { id: "24h", label: "24 hours", granularity: "hour" },
  { id: "7d", label: "7 days", granularity: "day" },
  { id: "30d", label: "30 days", granularity: "day" },
  { id: "90d", label: "90 days", granularity: "day" },
  { id: "12m", label: "12 months", granularity: "month" },
] as const satisfies readonly {
  id: string;
  label: string;
  granularity: EmailSendStatsGranularity;
}[];
export type TrafficRangePresetId = (typeof TRAFFIC_RANGE_PRESETS)[number]["id"];

export const DEFAULT_TRAFFIC_RANGE_PRESET: TrafficRangePresetId = "30d";

export type TrafficRangeSelection =
  | {
      kind: "preset";
      preset: TrafficRangePresetId;
      /** The moment the preset counts back from, epoch milliseconds. */
      now: number;
    }
  | {
      kind: "custom";
      /** First day of the range (inclusive). */
      first: CalendarDay;
      /** Last day of the range (inclusive). */
      last: CalendarDay;
    };

export interface TrafficRange {
  /** Start of the range (inclusive), epoch milliseconds. */
  from: number;
  /** End of the range (exclusive), epoch milliseconds. */
  to: number;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** The calendar day `epoch` falls on in `timeZone`. */
export function calendarDayInZone(
  epoch: number,
  timeZone: string,
): CalendarDay {
  const { year, month, day } = wallTimeInZone(epoch, timeZone);
  return { year, month, day };
}

/** The range a preset covers as of `now`, in `timeZone`. */
export function presetTrafficRange(
  preset: TrafficRangePresetId,
  now: number,
  timeZone: string,
): TrafficRange {
  const wall = wallTimeInZone(now, timeZone);
  const today: CalendarDay = wall;
  switch (preset) {
    case "24h": {
      // The current hour and the 23 before it.
      const to = zonedTimeToEpoch(
        timeZone,
        wall.year,
        wall.month,
        wall.day,
        wall.hour + 1,
      );
      return { from: to - 24 * HOUR_MS, to };
    }
    case "7d":
    case "30d":
    case "90d": {
      // Today and the days before it, whole local days.
      const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
      return {
        from: startOfZonedDay(addCalendarDays(today, 1 - days), timeZone),
        to: startOfZonedDay(addCalendarDays(today, 1), timeZone),
      };
    }
    case "12m":
      // This month and the 11 before it.
      return {
        from: zonedTimeToEpoch(timeZone, wall.year, wall.month - 11, 1),
        to: zonedTimeToEpoch(timeZone, wall.year, wall.month + 1, 1),
      };
  }
}

/**
 * The range of whole days `first`…`last` (both inclusive, in either
 * order) in `timeZone`.
 */
export function customTrafficRange(
  first: CalendarDay,
  last: CalendarDay,
  timeZone: string,
): TrafficRange {
  const [start, end] =
    startOfZonedDay(first, timeZone) <= startOfZonedDay(last, timeZone)
      ? [first, last]
      : [last, first];
  return {
    from: startOfZonedDay(start, timeZone),
    to: startOfZonedDay(addCalendarDays(end, 1), timeZone),
  };
}

export function resolveTrafficRange(
  selection: TrafficRangeSelection,
  timeZone: string,
): TrafficRange {
  return selection.kind === "preset"
    ? presetTrafficRange(selection.preset, selection.now, timeZone)
    : customTrafficRange(selection.first, selection.last, timeZone);
}

/** Whether `granularity` keeps `range` within the API's bucket cap. */
export function isGranularityAllowed(
  range: TrafficRange,
  granularity: EmailSendStatsGranularity,
): boolean {
  return (
    estimateEmailSendStatsBucketCount(range.from, range.to, granularity) <=
    MAX_EMAIL_SEND_STATS_BUCKETS
  );
}

/**
 * A readable bucket size for `range`: hourly up to two days, daily up to
 * about three months, weekly up to about 18 months, monthly beyond —
 * coarsened further if the bucket cap would otherwise be exceeded.
 */
export function autoTrafficGranularity(
  range: TrafficRange,
): EmailSendStatsGranularity {
  const span = range.to - range.from;
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
    coarser.find((granularity) => isGranularityAllowed(range, granularity)) ??
    "month"
  );
}

/** The granularity a new selection starts with: the preset's own, or auto. */
export function defaultTrafficGranularity(
  selection: TrafficRangeSelection,
  range: TrafficRange,
): EmailSendStatsGranularity {
  if (selection.kind === "preset") {
    const preset = TRAFFIC_RANGE_PRESETS.find(
      (entry) => entry.id === selection.preset,
    );
    if (preset !== undefined) return preset.granularity;
  }
  return autoTrafficGranularity(range);
}

/** The first and last calendar days `range` covers in `timeZone`. */
export function trafficRangeDays(
  range: TrafficRange,
  timeZone: string,
): { first: CalendarDay; last: CalendarDay } {
  return {
    first: calendarDayInZone(range.from, timeZone),
    last: calendarDayInZone(range.to - 1, timeZone),
  };
}
