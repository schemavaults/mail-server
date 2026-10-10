import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { sendEmail, type EmailSendLogWriter } from "../send-email";
import type { RecordEmailSendLogEntryInput } from "../mail-db/EmailSendLogRegistry";
import type {
  IMailTransport,
  IMailTransportSendOptions,
} from "../mail-transport";

const SEND_OPTIONS = {
  from: "sender@example.com",
  to: ["recipient@example.com"],
  subject: "Secret subject",
  html: "<p>Secret body</p>",
  text: "Secret body",
  attachments: [{ filename: "secret.txt", content: "c2VjcmV0" }],
} as const satisfies IMailTransportSendOptions;

const API_KEY_ID = "0f8fad5b-d9cb-469f-a165-70867728950e";

function fakeTransport(
  send: IMailTransport["send"],
): IMailTransport & { calls: IMailTransportSendOptions[] } {
  const calls: IMailTransportSendOptions[] = [];
  return {
    kind: "smtp",
    calls,
    send: async (options) => {
      calls.push(options);
      return await send(options);
    },
  };
}

function captureLog(): {
  writer: EmailSendLogWriter;
  entries: RecordEmailSendLogEntryInput[];
} {
  const entries: RecordEmailSendLogEntryInput[] = [];
  return {
    entries,
    writer: async (entry) => {
      entries.push(entry);
    },
  };
}

describe("sendEmail send logging", () => {
  it("logs a delivered send with its delivery time and no message content", async () => {
    const transport = fakeTransport(async () => ({ id: "provider-id-1" }));
    const log = captureLog();

    const before = Date.now();
    const result = await sendEmail(
      { ...SEND_OPTIONS, apiKeyId: API_KEY_ID },
      transport,
      log.writer,
    );
    const after = Date.now();

    expect(result).toEqual({ id: "provider-id-1" });
    expect(log.entries).toHaveLength(1);
    const entry = log.entries[0]!;
    expect(entry).toEqual({
      transport: "smtp",
      status: "delivered",
      attempted_at: expect.any(Number),
      delivered_at: expect.any(Number),
      error_message: null,
      provider_message_id: "provider-id-1",
      api_key_id: API_KEY_ID,
    });
    expect(entry.attempted_at).toBeGreaterThanOrEqual(before);
    expect(entry.delivered_at!).toBeGreaterThanOrEqual(entry.attempted_at);
    expect(entry.delivered_at!).toBeLessThanOrEqual(after);
    // Nothing about the message itself reaches the log.
    expect(JSON.stringify(entry)).not.toContain("Secret");
    expect(JSON.stringify(entry)).not.toContain("example.com");
  });

  it("does not hand the log-only options to the transport", async () => {
    const transport = fakeTransport(async () => ({ id: null }));
    const log = captureLog();

    await sendEmail(
      { ...SEND_OPTIONS, apiKeyId: API_KEY_ID, transport: "smtp" },
      transport,
      log.writer,
    );

    expect(transport.calls).toEqual([SEND_OPTIONS]);
  });

  it("attributes sends without an API key to nobody", async () => {
    const transport = fakeTransport(async () => ({ id: null }));
    const log = captureLog();

    await sendEmail(SEND_OPTIONS, transport, log.writer);

    expect(log.entries[0]).toMatchObject({
      status: "delivered",
      provider_message_id: null,
      api_key_id: null,
    });
  });

  it("logs a failed send with the error message and rethrows", async () => {
    const failure = new Error("421 Service not available");
    const transport = fakeTransport(async () => {
      throw failure;
    });
    const log = captureLog();

    const attempt = sendEmail(
      { ...SEND_OPTIONS, apiKeyId: API_KEY_ID },
      transport,
      log.writer,
    );

    await expect(attempt).rejects.toBe(failure);
    expect(log.entries).toEqual([
      {
        transport: "smtp",
        status: "failed",
        attempted_at: expect.any(Number),
        delivered_at: null,
        error_message: "421 Service not available",
        provider_message_id: null,
        api_key_id: API_KEY_ID,
      },
    ]);
  });

  it("never fails a delivered send because the log write failed", async () => {
    const transport = fakeTransport(async () => ({ id: "provider-id-2" }));
    const consoleError = spyOn(console, "error").mockImplementation(() => {});
    try {
      const result = await sendEmail(SEND_OPTIONS, transport, async () => {
        throw new Error("database unavailable");
      });
      expect(result).toEqual({ id: "provider-id-2" });
      expect(consoleError).toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("surfaces the send error, not the log write error, when both fail", async () => {
    const failure = new Error("connection refused");
    const transport = fakeTransport(async () => {
      throw failure;
    });
    const consoleError = spyOn(console, "error").mockImplementation(() => {});
    try {
      await expect(
        sendEmail(SEND_OPTIONS, transport, async () => {
          throw new Error("database unavailable");
        }),
      ).rejects.toBe(failure);
    } finally {
      consoleError.mockRestore();
    }
  });

  describe("when no transport can be built", () => {
    const ENV_KEYS = ["MAIL_TRANSPORT", "RESEND_API_KEY", "SMTP_HOST"] as const;
    let savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string>>;

    beforeEach(() => {
      savedEnv = {};
      for (const key of ENV_KEYS) {
        savedEnv[key] = process.env[key];
        delete process.env[key];
      }
    });

    afterEach(() => {
      for (const key of ENV_KEYS) {
        if (savedEnv[key] === undefined) delete process.env[key];
        else process.env[key] = savedEnv[key];
      }
    });

    it("logs the requested transport as failed with the config error", async () => {
      const log = captureLog();

      await expect(
        sendEmail(
          { ...SEND_OPTIONS, transport: "smtp" },
          undefined,
          log.writer,
        ),
      ).rejects.toThrow();

      expect(log.entries).toHaveLength(1);
      expect(log.entries[0]).toMatchObject({
        transport: "smtp",
        status: "failed",
        delivered_at: null,
      });
      expect(log.entries[0]!.error_message).toContain("SMTP_HOST");
    });

    it("logs the default transport when none was requested", async () => {
      const log = captureLog();

      await expect(
        sendEmail(SEND_OPTIONS, undefined, log.writer),
      ).rejects.toThrow();

      expect(log.entries[0]).toMatchObject({
        transport: "resend",
        status: "failed",
      });
    });

    it("logs no transport when MAIL_TRANSPORT itself is invalid", async () => {
      process.env.MAIL_TRANSPORT = "carrier-pigeon";
      const log = captureLog();

      await expect(
        sendEmail(SEND_OPTIONS, undefined, log.writer),
      ).rejects.toThrow();

      expect(log.entries[0]).toMatchObject({
        transport: null,
        status: "failed",
      });
      expect(log.entries[0]!.error_message).toContain("carrier-pigeon");
    });
  });
});
