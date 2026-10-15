import { describe, expect, it } from "bun:test";
import {
  autoTrafficGranularity,
  customTrafficRange,
  defaultTrafficGranularity,
  isGranularityAllowed,
  presetTrafficRange,
  resolveTrafficRange,
  trafficRangeDays,
  TRAFFIC_RANGE_PRESETS,
} from "../traffic-range";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// 2026-10-15 14:37:12 in New York (EDT, UTC-4) = 18:37:12Z. The ranges are
// computed in explicit zones, so the tests hold whatever zone they run in.
const NOW = Date.UTC(2026, 9, 15, 18, 37, 12);
const NY = "America/New_York";

describe("presetTrafficRange", () => {
  it("covers the current hour and the 23 before it", () => {
    const range = presetTrafficRange("24h", NOW, NY);
    expect(range.to - range.from).toBe(24 * HOUR);
    expect(range.to).toBe(Date.UTC(2026, 9, 15, 19)); // 15:00 EDT
  });

  it("aligns hours to a half-hour zone's own clock", () => {
    // 18:37Z is 00:07 on Oct 16 in Kolkata (UTC+5:30).
    const range = presetTrafficRange("24h", NOW, "Asia/Kolkata");
    expect(range.to).toBe(Date.UTC(2026, 9, 15, 19, 30)); // 01:00 IST
  });

  it("covers whole local days up to and including today", () => {
    const range = presetTrafficRange("7d", NOW, NY);
    expect(range.from).toBe(Date.UTC(2026, 9, 9, 4)); // Oct 9 00:00 EDT
    expect(range.to).toBe(Date.UTC(2026, 9, 16, 4)); // Oct 16 00:00 EDT
  });

  it("starts the day in the zone, not in UTC", () => {
    // At 18:37Z it is already Oct 16 in Tokyo.
    const range = presetTrafficRange("7d", NOW, "Asia/Tokyo");
    expect(range.to).toBe(Date.UTC(2026, 9, 16, 15)); // Oct 17 00:00 JST
  });

  it("spans a DST change with a 25-hour day", () => {
    // New York falls back on Nov 1 2026.
    const range = presetTrafficRange(
      "7d",
      Date.UTC(2026, 10, 3, 17),
      NY,
    );
    expect(range.from).toBe(Date.UTC(2026, 9, 28, 4)); // Oct 28 00:00 EDT
    expect(range.to).toBe(Date.UTC(2026, 10, 4, 5)); // Nov 4 00:00 EST
    expect(range.to - range.from).toBe(7 * DAY + HOUR);
  });

  it("covers this month and the 11 before it", () => {
    const range = presetTrafficRange("12m", NOW, "UTC");
    expect(range.from).toBe(Date.UTC(2025, 10, 1));
    expect(range.to).toBe(Date.UTC(2026, 10, 1));
  });

  it("only produces ranges the API accepts at the preset's granularity", () => {
    for (const preset of TRAFFIC_RANGE_PRESETS) {
      const selection = { kind: "preset", preset: preset.id, now: NOW } as const;
      const range = resolveTrafficRange(selection, NY);
      expect(defaultTrafficGranularity(selection, range)).toBe(
        preset.granularity,
      );
      expect(isGranularityAllowed(range, preset.granularity), preset.id).toBe(
        true,
      );
    }
  });
});

describe("customTrafficRange", () => {
  it("spans whole days in the zone, both ends inclusive, in either order", () => {
    const first = { year: 2026, month: 9, day: 1 };
    const last = { year: 2026, month: 9, day: 3 };
    for (const range of [
      customTrafficRange(first, last, NY),
      customTrafficRange(last, first, NY),
    ]) {
      expect(range.from).toBe(Date.UTC(2026, 9, 1, 4));
      expect(range.to).toBe(Date.UTC(2026, 9, 4, 4));
      expect(trafficRangeDays(range, NY)).toEqual({ first, last });
    }
  });

  it("groups a single day by hour and a quarter by day", () => {
    const day = { year: 2026, month: 9, day: 1 };
    const one = { kind: "custom", first: day, last: day } as const;
    expect(defaultTrafficGranularity(one, resolveTrafficRange(one, NY))).toBe(
      "hour",
    );
    const quarter = {
      kind: "custom",
      first: { year: 2026, month: 6, day: 1 },
      last: { year: 2026, month: 8, day: 30 },
    } as const;
    expect(
      defaultTrafficGranularity(quarter, resolveTrafficRange(quarter, NY)),
    ).toBe("day");
  });
});

describe("autoTrafficGranularity", () => {
  it("coarsens as the range grows, staying within the bucket cap", () => {
    const span = (ms: number) => ({ from: 0, to: ms });
    expect(autoTrafficGranularity(span(2 * DAY))).toBe("hour");
    expect(autoTrafficGranularity(span(60 * DAY))).toBe("day");
    expect(autoTrafficGranularity(span(365 * DAY))).toBe("week");
    expect(autoTrafficGranularity(span(5 * 365 * DAY))).toBe("month");
    const long = span(40 * 365 * DAY);
    expect(isGranularityAllowed(long, autoTrafficGranularity(long))).toBe(
      true,
    );
  });
});
