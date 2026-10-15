import { describe, expect, it } from "bun:test";
import {
  compareEmailSendStatsTransports,
  emailSendStatsSchema,
  estimateEmailSendStatsBucketCount,
  MAX_EMAIL_SEND_STATS_BUCKETS,
} from "../email-send-stats";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe("estimateEmailSendStatsBucketCount", () => {
  it("is zero for an empty or inverted range", () => {
    expect(estimateEmailSendStatsBucketCount(10, 10, "day")).toBe(0);
    expect(estimateEmailSendStatsBucketCount(20, 10, "day")).toBe(0);
  });

  it("never undercounts, partial buckets at either end included", () => {
    // 24 aligned hours touch 24 buckets; the bound allows one extra.
    expect(estimateEmailSendStatsBucketCount(0, 24 * HOUR, "hour")).toBe(25);
    // 30 days may span 31 local days when one is 23 hours long (DST).
    expect(
      estimateEmailSendStatsBucketCount(0, 30 * DAY, "day"),
    ).toBeGreaterThanOrEqual(31);
    // Twelve months may touch 13 calendar months.
    expect(
      estimateEmailSendStatsBucketCount(0, 365 * DAY, "month"),
    ).toBeGreaterThanOrEqual(13);
  });

  it("admits a month of hours and two years of days, not a year of hours", () => {
    const allowed = (span: number, g: "hour" | "day") =>
      estimateEmailSendStatsBucketCount(0, span, g) <=
      MAX_EMAIL_SEND_STATS_BUCKETS;
    expect(allowed(31 * DAY, "hour")).toBe(true);
    expect(allowed(2 * 365 * DAY, "day")).toBe(false);
    expect(allowed(366 * DAY, "day")).toBe(true);
    expect(allowed(365 * DAY, "hour")).toBe(false);
  });
});

describe("compareEmailSendStatsTransports", () => {
  it("orders known transports by registry, then others, then null", () => {
    const ids: (string | null)[] = [
      null,
      "zeta",
      "test-database-transport",
      "alpha",
      "smtp",
      "resend",
    ];
    expect(ids.sort(compareEmailSendStatsTransports)).toEqual([
      "resend",
      "smtp",
      "test-database-transport",
      "alpha",
      "zeta",
      null,
    ]);
  });
});

describe("emailSendStatsSchema", () => {
  it("accepts a stats payload with an unresolved transport", () => {
    const parsed = emailSendStatsSchema.safeParse({
      from: 0,
      to: DAY,
      timezone: "UTC",
      granularity: "day",
      totals: [{ transport: null, delivered: 0, failed: 2 }],
      buckets: [
        {
          bucket_start: 0,
          transports: [{ transport: null, delivered: 0, failed: 2 }],
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });
});
