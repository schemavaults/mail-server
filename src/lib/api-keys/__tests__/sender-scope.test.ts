import { describe, expect, test } from "bun:test";
import {
  allowedSenderEntrySchema,
  extractEmailAddress,
  senderMatchesAllowlist,
} from "../sender-scope";

describe("allowedSenderEntrySchema", () => {
  test("accepts a plain email address and lowercases it", () => {
    expect(allowedSenderEntrySchema.parse(" Claude@SchemaVaults.com ")).toBe(
      "claude@schemavaults.com",
    );
  });

  test("accepts a domain wildcard", () => {
    expect(allowedSenderEntrySchema.parse("*@schemavaults.com")).toBe(
      "*@schemavaults.com",
    );
  });

  test.each(["not-an-email", "*@", "*@not a domain", "a@*@b.com", "*"])(
    "rejects invalid entry '%s'",
    (entry) => {
      expect(allowedSenderEntrySchema.safeParse(entry).success).toBe(false);
    },
  );
});

describe("extractEmailAddress", () => {
  test("returns a bare address unchanged", () => {
    expect(extractEmailAddress("noreply@schemavaults.com")).toBe(
      "noreply@schemavaults.com",
    );
  });

  test("extracts the address from the display-name form", () => {
    expect(extractEmailAddress("SchemaVaults <noreply@schemavaults.com>")).toBe(
      "noreply@schemavaults.com",
    );
  });
});

describe("senderMatchesAllowlist", () => {
  const entries = ["claude@schemavaults.com", "*@agents.schemavaults.com"];

  test("matches an exact entry case-insensitively", () => {
    expect(senderMatchesAllowlist("Claude@SchemaVaults.com", entries)).toBe(
      true,
    );
  });

  test("matches any local part against a domain wildcard", () => {
    expect(
      senderMatchesAllowlist("anything@agents.schemavaults.com", entries),
    ).toBe(true);
  });

  test("a wildcard does not match subdomains or suffix-similar domains", () => {
    expect(
      senderMatchesAllowlist("a@sub.agents.schemavaults.com", entries),
    ).toBe(false);
    expect(
      senderMatchesAllowlist("a@evil-agents.schemavaults.com.attacker.com", [
        "*@schemavaults.com",
      ]),
    ).toBe(false);
  });

  test("rejects an address not in the allowlist", () => {
    expect(senderMatchesAllowlist("other@schemavaults.com", entries)).toBe(
      false,
    );
  });

  test("rejects a value without an @", () => {
    expect(senderMatchesAllowlist("claude", entries)).toBe(false);
  });

  test("empty allowlist matches nothing", () => {
    expect(senderMatchesAllowlist("claude@schemavaults.com", [])).toBe(false);
  });
});
