import { describe, expect, it } from "bun:test";
import type { TransportStatus } from "@/app/api/admin/transports/transport-status-schema";
import {
  buildTrafficSeries,
  NO_TRANSPORT_SERIES_ID,
} from "../traffic-series";

function status(
  id: TransportStatus["id"],
  configured: boolean,
  is_default = false,
): TransportStatus {
  return { id, configured, is_default, enabled: true };
}

const TRANSPORTS: TransportStatus[] = [
  status("resend", false),
  status("smtp", true, true),
  status("test-database-transport", false),
];

describe("buildTrafficSeries", () => {
  it("lists configured transports even without traffic", () => {
    const series = buildTrafficSeries(TRANSPORTS, []);
    expect(series.map((s) => s.id)).toEqual(["smtp"]);
    expect(series[0]).toMatchObject({
      label: "SMTP",
      configured: true,
      isDefault: true,
    });
  });

  it("adds transports with logged attempts, unconfigured or unknown", () => {
    const series = buildTrafficSeries(TRANSPORTS, [
      { transport: null, delivered: 0, failed: 1 },
      { transport: "legacy-relay", delivered: 3, failed: 0 },
      { transport: "resend", delivered: 5, failed: 1 },
    ]);
    expect(series.map((s) => s.id)).toEqual([
      "resend",
      "smtp",
      "legacy-relay",
      NO_TRANSPORT_SERIES_ID,
    ]);
    expect(series.find((s) => s.id === "resend")?.configured).toBe(false);
    expect(series.find((s) => s.id === "legacy-relay")?.label).toBe(
      "legacy-relay",
    );
  });

  it("keeps each transport's colour whatever else is shown", () => {
    const alone = buildTrafficSeries(TRANSPORTS, []);
    const crowded = buildTrafficSeries(TRANSPORTS, [
      { transport: "resend", delivered: 1, failed: 0 },
      { transport: "test-database-transport", delivered: 1, failed: 0 },
      { transport: "legacy-relay", delivered: 1, failed: 0 },
      { transport: null, delivered: 0, failed: 1 },
    ]);
    const colorOf = (series: typeof alone, id: string) =>
      series.find((s) => s.id === id)?.colorId;

    expect(colorOf(alone, "smtp")).toBe("chart-2");
    expect(colorOf(crowded, "smtp")).toBe("chart-2");
    expect(colorOf(crowded, "resend")).toBe("chart-1");
    expect(colorOf(crowded, "test-database-transport")).toBe("chart-3");
    expect(colorOf(crowded, "legacy-relay")).toBe("chart-4");
    expect(colorOf(crowded, NO_TRANSPORT_SERIES_ID)).toBe("other");
  });
});
