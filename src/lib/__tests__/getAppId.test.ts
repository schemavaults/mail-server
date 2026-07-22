import { afterEach, describe, expect, test } from "bun:test";
import { getAppId, DEFAULT_SCHEMAVAULTS_MAIL_APP_ID } from "../getAppId";

const ENV_VARS = [
  "NEXT_PUBLIC_SCHEMAVAULTS_API_SERVER_ID",
  "SCHEMAVAULTS_API_SERVER_ID",
] as const;

afterEach(() => {
  for (const key of ENV_VARS) {
    delete process.env[key];
  }
});

describe("getAppId", () => {
  test("falls back to the default mail app ID when no env var is set", () => {
    for (const key of ENV_VARS) {
      delete process.env[key];
    }
    expect(getAppId()).toBe(DEFAULT_SCHEMAVAULTS_MAIL_APP_ID);
    expect(getAppId()).toBe("schemavaults-mail");
  });

  test("uses SCHEMAVAULTS_API_SERVER_ID when set", () => {
    process.env.SCHEMAVAULTS_API_SERVER_ID = "custom-mail-server";
    expect(getAppId()).toBe("custom-mail-server");
  });

  test("prefers NEXT_PUBLIC_SCHEMAVAULTS_API_SERVER_ID over the server-only variable", () => {
    process.env.NEXT_PUBLIC_SCHEMAVAULTS_API_SERVER_ID = "public-mail-server";
    process.env.SCHEMAVAULTS_API_SERVER_ID = "server-mail-server";
    expect(getAppId()).toBe("public-mail-server");
  });

  test("throws when the configured value is not a valid API server ID", () => {
    process.env.SCHEMAVAULTS_API_SERVER_ID = "-Invalid ID!";
    expect(() => getAppId()).toThrow();
  });
});
