import { describe, expect, it } from "bun:test";
import { apiKeyNameSchema } from "../api-key-name";

describe("apiKeyNameSchema", () => {
  it("accepts an ordinary name", () => {
    const parsed = apiKeyNameSchema.safeParse("prod cron job");
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toBe("prod cron job");
  });

  it("trims surrounding whitespace", () => {
    const parsed = apiKeyNameSchema.safeParse("  renamed key \n");
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toBe("renamed key");
  });

  it("rejects an empty name", () => {
    expect(apiKeyNameSchema.safeParse("").success).toBe(false);
  });

  it("rejects a whitespace-only name", () => {
    expect(apiKeyNameSchema.safeParse("   ").success).toBe(false);
  });

  it("accepts a name of exactly 64 characters", () => {
    expect(apiKeyNameSchema.safeParse("a".repeat(64)).success).toBe(true);
  });

  it("rejects a name longer than 64 characters", () => {
    expect(apiKeyNameSchema.safeParse("a".repeat(65)).success).toBe(false);
  });
});
