import { describe, expect, test } from "bun:test";
import generateConfirmationToken from "../generateConfirmationToken";
import isValidBase64Url from "@/lib/isValidBase64Url";

describe("generateConfirmationToken", () => {
  test("produces a plaintext token that passes isValidBase64Url", async () => {
    const { plaintext } = await generateConfirmationToken();
    expect(isValidBase64Url(plaintext)).toBe(true);
  });

  test("produces a fresh token across many iterations, all valid base64url", async () => {
    const seen = new Set<string>();
    for (let i = 0; i < 32; i++) {
      const { plaintext } = await generateConfirmationToken();
      expect(isValidBase64Url(plaintext)).toBe(true);
      seen.add(plaintext);
    }
    expect(seen.size).toBe(32);
  });
});
