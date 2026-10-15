import { describe, expect, it } from "bun:test";
import {
  autoTrafficGranularity,
  customTrafficRange,
  isGranularityAllowed,
  lastDayOfTrafficRange,
  presetTrafficRange,
  TRAFFIC_RANGE_PRESETS,
} from "../traffic-range";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Computed in whatever time zone the tests run in; the assertions only
// rely on local-time properties, so they hold in any zone.
const NOW = new Date(2026, 9, 15, 14, 37, 12);

function isLocalMidnight(epoch: number): boolean {
  const date = new Date(epoch);
  return (
    date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0
  );
}

describe("presetTrafficRange", () => {
  it("covers the current hour and the 23 before it, hourly", () => {
    const range = presetTrafficRange("24h", NOW);
    expect(range.granularity).toBe("hour");
    expect(range.to - range.from).toBe(24 * HOUR);
    expect(new Date(range.to)).toEqual(new Date(2026, 9, 15, 15));
  });

  it("covers whole local days up to and including today", () => {
    for (const [preset, days] of [
      ["7d", 7],
      ["30d", 30],
      ["90d", 90],
    ] as const) {
      const range = presetTrafficRange(preset, NOW);
      expect(range.granularity).toBe("day");
      expect(isLocalMidnight(range.from)).toBe(true);
      expect(new Date(range.to)).toEqual(new Date(2026, 9, 16));
      expect(new Date(range.from)).toEqual(new Date(2026, 9, 16 - days));
    }
  });

  it("covers this month and the 11 before it, monthly", () => {
    const range = presetTrafficRange("12m", NOW);
    expect(range.granularity).toBe("month");
    expect(new Date(range.from)).toEqual(new Date(2025, 10, 1));
    expect(new Date(range.to)).toEqual(new Date(2026, 10, 1));
  });

  it("only produces ranges the API accepts", () => {
    for (const { id } of TRAFFIC_RANGE_PRESETS) {
      const range = presetTrafficRange(id, NOW);
      expect(
        isGranularityAllowed(range.from, range.to, range.granularity),
        id,
      ).toBe(true);
    }
  });
});

describe("customTrafficRange", () => {
  it("spans whole local days, both ends inclusive, in either order", () => {
    const first = new Date(2026, 9, 1, 18);
    const last = new Date(2026, 9, 3, 6);
    for (const range of [
      customTrafficRange(first, last),
      customTrafficRange(last, first),
    ]) {
      expect(range.preset).toBe("custom");
      expect(new Date(range.from)).toEqual(new Date(2026, 9, 1));
      expect(new Date(range.to)).toEqual(new Date(2026, 9, 4));
      expect(range.granularity).toBe("day");
      expect(lastDayOfTrafficRange(range).getDate()).toBe(3);
    }
  });

  it("groups a single day by hour", () => {
    const day = new Date(2026, 9, 1);
    expect(customTrafficRange(day, day).granularity).toBe("hour");
  });
});

describe("autoTrafficGranularity", () => {
  it("coarsens as the range grows, staying within the bucket cap", () => {
    expect(autoTrafficGranularity(0, 2 * DAY)).toBe("hour");
    expect(autoTrafficGranularity(0, 60 * DAY)).toBe("day");
    expect(autoTrafficGranularity(0, 365 * DAY)).toBe("week");
    expect(autoTrafficGranularity(0, 5 * 365 * DAY)).toBe("month");
    const span = 40 * 365 * DAY;
    const granularity = autoTrafficGranularity(0, span);
    expect(isGranularityAllowed(0, span, granularity)).toBe(true);
  });
});
