import { describe, expect, test } from "bun:test";
import {
  corsAllowedOriginRowSchema,
  corsOriginValueSchema,
} from "../cors-allowed-origins-table";

describe("corsOriginValueSchema", () => {
  test.each([
    "https://schemavaults.com",
    "https://staging.schemavaults.com",
    "http://localhost:3000",
    "http://localhost:5346",
    "https://example.com:8443",
  ])("accepts valid origin %s", (origin) => {
    expect(corsOriginValueSchema.safeParse(origin).success).toBe(true);
  });

  test.each([
    "https://schemavaults.com/",
    "https://schemavaults.com/path",
    "https://schemavaults.com?query=1",
    "schemavaults.com",
    "not a url",
    "",
    "https://",
  ])("rejects invalid origin %s", (origin) => {
    expect(corsOriginValueSchema.safeParse(origin).success).toBe(false);
  });
});

describe("corsAllowedOriginRowSchema", () => {
  const validRow = {
    cors_origin_id: "a2b8b7de-32a1-4a5c-9a6b-0d5a2f9b4c11",
    origin: "https://schemavaults.com",
    description: null,
    created_at: 1_750_000_000_000,
    created_by_user_id: "5f2d9c44-71e8-4c39-b1a4-8e63f0a1d927",
  };

  test("accepts a fully-specified row", () => {
    expect(corsAllowedOriginRowSchema.safeParse(validRow).success).toBe(true);
  });

  test("accepts a string description", () => {
    const row = { ...validRow, description: "Marketing site join form" };
    expect(corsAllowedOriginRowSchema.safeParse(row).success).toBe(true);
  });

  test("rejects unknown keys (strict)", () => {
    const row = { ...validRow, unexpected: "extra" };
    expect(corsAllowedOriginRowSchema.safeParse(row).success).toBe(false);
  });

  test("rejects a non-UUID created_by_user_id", () => {
    const row = { ...validRow, created_by_user_id: "user-123" };
    expect(corsAllowedOriginRowSchema.safeParse(row).success).toBe(false);
  });

  test.each(Object.keys(validRow))("rejects a row missing %s", (key) => {
    const row: Record<string, unknown> = { ...validRow };
    delete row[key];
    expect(corsAllowedOriginRowSchema.safeParse(row).success).toBe(false);
  });
});
