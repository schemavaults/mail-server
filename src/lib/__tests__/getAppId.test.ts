import { afterEach, describe, expect, test } from "bun:test";
import { getAppId, DEFAULT_SCHEMAVAULTS_MAIL_APP_ID } from "../getAppId";

afterEach(() => {
  delete process.env.SCHEMAVAULTS_API_SERVER_ID;
});

describe("getAppId", () => {
  test("falls back to the default mail app ID when the env var is not set", () => {
    delete process.env.SCHEMAVAULTS_API_SERVER_ID;
    expect(getAppId()).toBe(DEFAULT_SCHEMAVAULTS_MAIL_APP_ID);
    expect(getAppId()).toBe("schemavaults-mail");
  });

  test("uses SCHEMAVAULTS_API_SERVER_ID when set", () => {
    process.env.SCHEMAVAULTS_API_SERVER_ID = "custom-mail-server";
    expect(getAppId()).toBe("custom-mail-server");
  });

  test("throws when the configured value is not a valid API server ID", () => {
    process.env.SCHEMAVAULTS_API_SERVER_ID = "-Invalid ID!";
    expect(() => getAppId()).toThrow();
  });
});
