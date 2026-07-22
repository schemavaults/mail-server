import { describe, expect, test } from "bun:test";
import { corsOriginValueSchema } from "../cors-allowed-origins-table";

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
