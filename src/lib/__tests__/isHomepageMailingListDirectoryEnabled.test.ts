import { afterEach, describe, expect, test } from "bun:test";
import { isHomepageMailingListDirectoryEnabled } from "../branding";

afterEach(() => {
  delete process.env.HOMEPAGE_SHOW_MAILING_LISTS;
});

describe("isHomepageMailingListDirectoryEnabled", () => {
  test("defaults to enabled when the env var is not set", () => {
    delete process.env.HOMEPAGE_SHOW_MAILING_LISTS;
    expect(isHomepageMailingListDirectoryEnabled()).toBe(true);
  });

  test("stays enabled for an empty string", () => {
    process.env.HOMEPAGE_SHOW_MAILING_LISTS = "";
    expect(isHomepageMailingListDirectoryEnabled()).toBe(true);
  });

  test("stays enabled when explicitly set to true", () => {
    process.env.HOMEPAGE_SHOW_MAILING_LISTS = "true";
    expect(isHomepageMailingListDirectoryEnabled()).toBe(true);
  });

  test.each(["false", "FALSE", "False", " false ", "0", "no", "off"])(
    "is disabled when set to %p",
    (value: string) => {
      process.env.HOMEPAGE_SHOW_MAILING_LISTS = value;
      expect(isHomepageMailingListDirectoryEnabled()).toBe(false);
    },
  );

  test("treats unrecognized values as enabled", () => {
    process.env.HOMEPAGE_SHOW_MAILING_LISTS = "banana";
    expect(isHomepageMailingListDirectoryEnabled()).toBe(true);
  });
});
