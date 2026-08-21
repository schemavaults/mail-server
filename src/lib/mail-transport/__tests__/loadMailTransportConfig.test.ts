import { describe, expect, test } from "bun:test";
import {
  loadMailTransportConfig,
  DEFAULT_SMTP_PORT,
} from "../loadMailTransportConfig";
import MailTransportConfigError from "../MailTransportConfigError";

describe("loadMailTransportConfig", () => {
  describe("transport selection", () => {
    test("defaults to resend when MAIL_TRANSPORT is unset", () => {
      const config = loadMailTransportConfig({ RESEND_API_KEY: "re_123" });
      expect(config.kind).toBe("resend");
    });

    test("defaults to resend when MAIL_TRANSPORT is empty/whitespace", () => {
      const config = loadMailTransportConfig({
        MAIL_TRANSPORT: "   ",
        RESEND_API_KEY: "re_123",
      });
      expect(config.kind).toBe("resend");
    });

    test("selects smtp when MAIL_TRANSPORT is 'smtp' (case-insensitive)", () => {
      const config = loadMailTransportConfig({
        MAIL_TRANSPORT: "SMTP",
        SMTP_HOST: "smtp.example.com",
      });
      expect(config.kind).toBe("smtp");
    });

    test("throws MailTransportConfigError for an unknown transport", () => {
      expect(() =>
        loadMailTransportConfig({ MAIL_TRANSPORT: "sendgrid" }),
      ).toThrow(MailTransportConfigError);
    });
  });

  describe("resend transport", () => {
    test("returns the API key from RESEND_API_KEY", () => {
      const config = loadMailTransportConfig({
        MAIL_TRANSPORT: "resend",
        RESEND_API_KEY: "re_123",
      });
      expect(config).toEqual({ kind: "resend", apiKey: "re_123" });
    });

    test("throws MailTransportConfigError when RESEND_API_KEY is missing", () => {
      expect(() =>
        loadMailTransportConfig({ MAIL_TRANSPORT: "resend" }),
      ).toThrow(MailTransportConfigError);
    });
  });

  describe("smtp transport", () => {
    test("throws MailTransportConfigError when SMTP_HOST is missing", () => {
      expect(() => loadMailTransportConfig({ MAIL_TRANSPORT: "smtp" })).toThrow(
        MailTransportConfigError,
      );
    });

    test("applies defaults: port 587, STARTTLS (secure=false), no auth", () => {
      const config = loadMailTransportConfig({
        MAIL_TRANSPORT: "smtp",
        SMTP_HOST: "smtp.example.com",
      });
      expect(config).toEqual({
        kind: "smtp",
        host: "smtp.example.com",
        port: DEFAULT_SMTP_PORT,
        secure: false,
        auth: null,
      });
    });

    test("defaults to implicit TLS when SMTP_PORT is 465 and SMTP_SECURE is unset", () => {
      const config = loadMailTransportConfig({
        MAIL_TRANSPORT: "smtp",
        SMTP_HOST: "smtp.example.com",
        SMTP_PORT: "465",
      });
      expect(config).toMatchObject({ port: 465, secure: true });
    });

    test("an explicit SMTP_SECURE wins over the port-465 convention", () => {
      const config = loadMailTransportConfig({
        MAIL_TRANSPORT: "smtp",
        SMTP_HOST: "smtp.example.com",
        SMTP_PORT: "465",
        SMTP_SECURE: "false",
      });
      expect(config).toMatchObject({ port: 465, secure: false });
    });

    test("parses SMTP_SECURE='true' and '1' as implicit TLS", () => {
      for (const raw of ["true", "TRUE", "1"]) {
        const config = loadMailTransportConfig({
          MAIL_TRANSPORT: "smtp",
          SMTP_HOST: "smtp.example.com",
          SMTP_SECURE: raw,
        });
        expect(config).toMatchObject({ secure: true });
      }
    });

    test("throws MailTransportConfigError for a non-boolean SMTP_SECURE", () => {
      expect(() =>
        loadMailTransportConfig({
          MAIL_TRANSPORT: "smtp",
          SMTP_HOST: "smtp.example.com",
          SMTP_SECURE: "yes please",
        }),
      ).toThrow(MailTransportConfigError);
    });

    test("throws MailTransportConfigError for a malformed SMTP_PORT", () => {
      for (const raw of ["abc", "0", "65536", "1.5"]) {
        expect(() =>
          loadMailTransportConfig({
            MAIL_TRANSPORT: "smtp",
            SMTP_HOST: "smtp.example.com",
            SMTP_PORT: raw,
          }),
        ).toThrow(MailTransportConfigError);
      }
    });

    test("returns credentials when SMTP_USER and SMTP_PASS are both set", () => {
      const config = loadMailTransportConfig({
        MAIL_TRANSPORT: "smtp",
        SMTP_HOST: "smtp.example.com",
        SMTP_USER: "mailer",
        SMTP_PASS: "hunter2",
      });
      expect(config).toMatchObject({
        auth: { user: "mailer", pass: "hunter2" },
      });
    });

    test("throws MailTransportConfigError when only one of SMTP_USER/SMTP_PASS is set", () => {
      expect(() =>
        loadMailTransportConfig({
          MAIL_TRANSPORT: "smtp",
          SMTP_HOST: "smtp.example.com",
          SMTP_USER: "mailer",
        }),
      ).toThrow(MailTransportConfigError);
      expect(() =>
        loadMailTransportConfig({
          MAIL_TRANSPORT: "smtp",
          SMTP_HOST: "smtp.example.com",
          SMTP_PASS: "hunter2",
        }),
      ).toThrow(MailTransportConfigError);
    });
  });
});
