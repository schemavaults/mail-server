import type { EmailSendStatsGranularity } from "@/lib/mail-db/email-send-stats";

// Labels for the /admin/email-traffic page. Bucket labels are formatted in
// the same time zone the stats were bucketed in, so a daily bucket starting
// at local midnight is labelled with that local date.

const dateFormats = new Map<string, Intl.DateTimeFormat>();

function dateFormat(
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  let format = dateFormats.get(key);
  if (format === undefined) {
    format = new Intl.DateTimeFormat(undefined, { ...options, timeZone });
    dateFormats.set(key, format);
  }
  return format;
}

/** A short x-axis label for the bucket starting at `start`. */
export function formatBucketAxisLabel(
  start: number,
  granularity: EmailSendStatsGranularity,
  timeZone: string,
): string {
  switch (granularity) {
    case "hour":
      return dateFormat(timeZone, {
        month: "short",
        day: "numeric",
        hour: "numeric",
      }).format(start);
    case "day":
    case "week":
      return dateFormat(timeZone, { month: "short", day: "numeric" }).format(
        start,
      );
    case "month":
      return dateFormat(timeZone, { month: "short", year: "numeric" }).format(
        start,
      );
  }
}

/** The full name of the bucket starting at `start`, for readouts and tables. */
export function formatBucketTitle(
  start: number,
  granularity: EmailSendStatsGranularity,
  timeZone: string,
): string {
  switch (granularity) {
    case "hour":
      return dateFormat(timeZone, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(start);
    case "day":
      return dateFormat(timeZone, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(start);
    case "week":
      return `Week of ${dateFormat(timeZone, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(start)}`;
    case "month":
      return dateFormat(timeZone, { month: "long", year: "numeric" }).format(
        start,
      );
  }
}

export const GRANULARITY_LABELS: Record<EmailSendStatsGranularity, string> = {
  hour: "Hourly",
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

const countFormat = new Intl.NumberFormat("en-US");
const shareFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatCount(value: number): string {
  return countFormat.format(value);
}

/** `part / whole` as a percentage, or an em dash when there is no whole. */
export function formatShare(part: number, whole: number): string {
  return whole > 0 ? shareFormat.format(part / whole) : "—";
}
