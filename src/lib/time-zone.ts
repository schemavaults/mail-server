import { z } from "@/lib/zod-openapi";

// IANA time zone helpers shared by the server and the admin pages: input
// validation, wall-clock arithmetic in an arbitrary zone (so a page can
// compute "local midnight" in the deployment's time zone rather than the
// browser's), and timestamp formatting. Client-safe.

/**
 * True iff `timeZone` is an IANA time zone name (e.g. `UTC`,
 * `America/New_York`). Bare UTC offsets such as `+05:30` are refused even
 * where the runtime accepts them: Postgres reads them as POSIX zones, with
 * the sign inverted.
 */
export function isValidIanaTimeZone(timeZone: string): boolean {
  if (!/^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+)*$/.test(timeZone)) {
    return false;
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export const ianaTimeZoneSchema = z
  .string()
  .max(64)
  .refine(isValidIanaTimeZone, {
    message: "Expected an IANA time zone name, e.g. 'America/New_York'.",
  });

/** The browser's (or runtime's) IANA time zone, or UTC when it has none. */
export function browserTimeZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidIanaTimeZone(zone) ? zone : "UTC";
  } catch {
    return "UTC";
  }
}

/** Every IANA zone the runtime knows, UTC first; [UTC] where unsupported. */
export function listIanaTimeZones(): string[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch {
    // Older runtimes: only offer UTC (any valid name can still be typed in
    // through the API).
  }
  return ["UTC", ...zones.filter((zone) => zone !== "UTC")];
}

/** A calendar day (month is 0-based, like `Date`). */
export interface CalendarDay {
  year: number;
  month: number;
  day: number;
}

/** The wall-clock reading of an instant in some time zone. */
export interface WallTime extends CalendarDay {
  hour: number;
  minute: number;
  second: number;
}

const wallTimeFormats = new Map<string, Intl.DateTimeFormat>();

/** What a clock in `timeZone` reads at `epoch` (milliseconds). */
export function wallTimeInZone(epoch: number, timeZone: string): WallTime {
  let format = wallTimeFormats.get(timeZone);
  if (format === undefined) {
    format = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    wallTimeFormats.set(timeZone, format);
  }
  const parts: Record<string, number> = {};
  for (const part of format.formatToParts(epoch)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  return {
    year: parts.year ?? 1970,
    month: (parts.month ?? 1) - 1,
    day: parts.day ?? 1,
    hour: (parts.hour ?? 0) % 24,
    minute: parts.minute ?? 0,
    second: parts.second ?? 0,
  };
}

/** `timeZone`'s offset from UTC at `epoch`, in milliseconds. */
function offsetAt(epoch: number, timeZone: string): number {
  const wall = wallTimeInZone(epoch, timeZone);
  const wholeSecond = epoch - (((epoch % 1000) + 1000) % 1000);
  return (
    Date.UTC(
      wall.year,
      wall.month,
      wall.day,
      wall.hour,
      wall.minute,
      wall.second,
    ) - wholeSecond
  );
}

/**
 * The instant a clock in `timeZone` reads the given wall time. Out-of-range
 * fields roll over like `Date.UTC` (day 0 is the previous month's last
 * day, hour 24 is the next midnight). A wall time skipped by a DST change
 * resolves to an instant next to the gap.
 */
export function zonedTimeToEpoch(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): number {
  const asUtc = Date.UTC(year, month, day, hour, minute);
  const guess = asUtc - offsetAt(asUtc, timeZone);
  // The offset at the guess can differ (a DST change in between); one more
  // pass lands on the right side of it.
  return asUtc - offsetAt(guess, timeZone);
}

/** The instant `day` starts (local midnight) in `timeZone`. */
export function startOfZonedDay(day: CalendarDay, timeZone: string): number {
  return zonedTimeToEpoch(timeZone, day.year, day.month, day.day);
}

/** `day` moved by `days` calendar days. */
export function addCalendarDays(day: CalendarDay, days: number): CalendarDay {
  const date = new Date(Date.UTC(day.year, day.month, day.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

/** Orders calendar days chronologically (negative when `a` is earlier). */
export function compareCalendarDays(a: CalendarDay, b: CalendarDay): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

/**
 * Formats a timestamp for the admin pages: date and time with the zone's
 * abbreviation, in `timeZone` (or the browser's zone when undefined).
 */
export function formatDateTime(
  value: number,
  timeZone: string | undefined,
): string {
  return new Date(value).toLocaleString(undefined, {
    timeZone,
    timeZoneName: "short",
  });
}

/** Formats a timestamp's date only, in `timeZone` (or the browser's). */
export function formatDate(
  value: number,
  timeZone: string | undefined,
): string {
  return new Date(value).toLocaleDateString(undefined, { timeZone });
}
