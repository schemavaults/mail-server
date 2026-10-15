import { describe, expect, it } from "bun:test";
import {
  addCalendarDays,
  compareCalendarDays,
  formatDateTime,
  isValidIanaTimeZone,
  listIanaTimeZones,
  startOfZonedDay,
  wallTimeInZone,
  zonedTimeToEpoch,
} from "../time-zone";

const NY = "America/New_York";

describe("isValidIanaTimeZone", () => {
  it("accepts IANA zone names", () => {
    for (const zone of [
      "UTC",
      "America/New_York",
      "Asia/Kolkata",
      "America/Argentina/Buenos_Aires",
      "Etc/GMT+5",
    ]) {
      expect(isValidIanaTimeZone(zone), zone).toBe(true);
    }
  });

  it("refuses unknown zones, bare offsets, and SQL-ish input", () => {
    for (const zone of [
      "",
      "Mars/Olympus",
      "+05:30",
      "-08:00",
      "UTC'; DROP TABLE email_send_log; --",
      "America/New York",
    ]) {
      expect(isValidIanaTimeZone(zone), zone).toBe(false);
    }
  });
});

describe("wallTimeInZone", () => {
  it("reads the clock in the zone", () => {
    const epoch = Date.UTC(2026, 9, 15, 3, 30, 45);
    expect(wallTimeInZone(epoch, NY)).toEqual({
      year: 2026,
      month: 9,
      day: 14,
      hour: 23,
      minute: 30,
      second: 45,
    });
    expect(wallTimeInZone(epoch, "Asia/Kolkata")).toMatchObject({
      day: 15,
      hour: 9,
      minute: 0,
    });
  });
});

describe("zonedTimeToEpoch", () => {
  it("is the inverse of wallTimeInZone", () => {
    expect(zonedTimeToEpoch(NY, 2026, 9, 14, 23, 30)).toBe(
      Date.UTC(2026, 9, 15, 3, 30),
    );
    expect(zonedTimeToEpoch("Asia/Kolkata", 2026, 9, 15, 9)).toBe(
      Date.UTC(2026, 9, 15, 3, 30),
    );
  });

  it("uses the offset in force on that day, either side of DST", () => {
    expect(startOfZonedDay({ year: 2026, month: 9, day: 31 }, NY)).toBe(
      Date.UTC(2026, 9, 31, 4), // EDT
    );
    expect(startOfZonedDay({ year: 2026, month: 10, day: 2 }, NY)).toBe(
      Date.UTC(2026, 10, 2, 5), // EST
    );
  });

  it("rolls over out-of-range fields like Date.UTC", () => {
    expect(zonedTimeToEpoch("UTC", 2026, 0, 0)).toBe(Date.UTC(2025, 11, 31));
    expect(zonedTimeToEpoch("UTC", 2026, 0, 31, 24)).toBe(
      Date.UTC(2026, 1, 1),
    );
  });
});

describe("calendar days", () => {
  it("add across month and year ends", () => {
    expect(addCalendarDays({ year: 2026, month: 11, day: 30 }, 2)).toEqual({
      year: 2027,
      month: 0,
      day: 1,
    });
    expect(addCalendarDays({ year: 2026, month: 2, day: 1 }, -1)).toEqual({
      year: 2026,
      month: 1,
      day: 28,
    });
  });

  it("compare chronologically", () => {
    const a = { year: 2026, month: 0, day: 31 };
    const b = { year: 2026, month: 1, day: 1 };
    expect(compareCalendarDays(a, b)).toBeLessThan(0);
    expect(compareCalendarDays(b, a)).toBeGreaterThan(0);
    expect(compareCalendarDays(a, { ...a })).toBe(0);
  });
});

describe("formatDateTime", () => {
  it("shows the time in the given zone, naming the zone", () => {
    const text = formatDateTime(Date.UTC(2026, 9, 15, 18, 37), NY);
    expect(text).toContain("2026");
    expect(text).toMatch(/2:37/);
    expect(text).toMatch(/EDT|GMT-4/);
  });
});

describe("listIanaTimeZones", () => {
  it("lists UTC first, once", () => {
    const zones = listIanaTimeZones();
    expect(zones[0]).toBe("UTC");
    expect(zones.filter((zone) => zone === "UTC")).toHaveLength(1);
    for (const zone of zones) expect(isValidIanaTimeZone(zone), zone).toBe(true);
  });
});
