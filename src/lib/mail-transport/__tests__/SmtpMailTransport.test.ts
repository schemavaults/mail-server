import { describe, expect, it } from "bun:test";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { SmtpMailTransport } from "../SmtpMailTransport";
import type { IMailTransportSendOptions } from "../types";

// Drives the transport through nodemailer's stream transport, which builds
// the exact RFC 822 message an SMTP relay would receive without opening a
// connection; the assertions inspect that message's MIME parts.

const CSV_BASE64 = Buffer.from("id,total\n1,42.00\n").toString("base64");
const PNG_BASE64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]).toString(
  "base64",
);
const NOTES_BASE64 = Buffer.from("plain notes").toString("base64");

interface MimePart {
  headers: string;
  body: string;
}

async function composeMessage(
  options: IMailTransportSendOptions,
): Promise<string> {
  let message = "";
  const streamTransporter = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: "unix",
  });
  // Capture the composed message; the stream transport's SentMessageInfo
  // carries it, but SmtpMailTransport only returns the message ID.
  const transporter = {
    sendMail: async (mail: nodemailer.SendMailOptions) => {
      const info = await streamTransporter.sendMail(mail);
      message = (info.message as Buffer).toString("utf8");
      return info;
    },
  } as unknown as nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  await new SmtpMailTransport(
    { kind: "smtp", host: "smtp.invalid", port: 587, secure: false, auth: null },
    transporter,
  ).send(options);
  return message;
}

/** Leaf MIME parts of a composed message (nested multiparts flattened). */
function leafParts(message: string): MimePart[] {
  const parts: MimePart[] = [];
  const visit = (entity: string) => {
    const split = entity.indexOf("\n\n");
    const headers = entity.slice(0, split);
    const body = entity.slice(split + 2);
    const boundary = /boundary="?([^";\n]+)"?/i.exec(headers)?.[1];
    if (!/^content-type:\s*multipart\//im.test(headers) || !boundary) {
      parts.push({ headers, body });
      return;
    }
    const chunks = body.split(`--${boundary}`);
    // chunks[0] is the preamble and the last chunk the closing "--".
    for (const chunk of chunks.slice(1, -1)) visit(chunk.replace(/^\n/, ""));
  };
  visit(message);
  return parts;
}

function partForFilename(message: string, filename: string): MimePart {
  const part = leafParts(message).find((p) =>
    p.headers.includes(`filename=${filename}`),
  );
  if (!part) throw new Error(`No MIME part for '${filename}' in:\n${message}`);
  return part;
}

const baseOptions = {
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Report",
  html: '<p>Report attached.</p><img src="cid:logo">',
  text: "Report attached.",
} satisfies IMailTransportSendOptions;

describe("SmtpMailTransport attachments", () => {
  it("attaches each file with its bytes intact and its content type", async () => {
    const message = await composeMessage({
      ...baseOptions,
      attachments: [
        { filename: "report.csv", content: CSV_BASE64, contentType: "text/csv" },
      ],
    });

    const part = partForFilename(message, "report.csv");
    expect(part.headers).toMatch(/^content-type: text\/csv/im);
    expect(part.headers).toMatch(/^content-disposition: attachment/im);
    expect(part.headers).toMatch(/^content-transfer-encoding: base64/im);
    expect(part.body.replace(/\s+/g, "")).toBe(CSV_BASE64);
  });

  it("derives a missing content type from the filename", async () => {
    const message = await composeMessage({
      ...baseOptions,
      attachments: [{ filename: "notes.txt", content: NOTES_BASE64 }],
    });

    const part = partForFilename(message, "notes.txt");
    expect(part.headers).toMatch(/^content-type: text\/plain/im);
    expect(part.body.replace(/\s+/g, "")).toBe(NOTES_BASE64);
  });

  it("sends a file with a contentId inline, related to the HTML body", async () => {
    const message = await composeMessage({
      ...baseOptions,
      attachments: [
        { filename: "report.csv", content: CSV_BASE64, contentType: "text/csv" },
        {
          filename: "logo.png",
          content: PNG_BASE64,
          contentType: "image/png",
          contentId: "logo",
        },
      ],
    });

    expect(message).toMatch(/^content-type: multipart\/related/im);
    const logo = partForFilename(message, "logo.png");
    expect(logo.headers).toMatch(/^content-id: <logo>/im);
    expect(logo.headers).toMatch(/^content-disposition: inline/im);
    expect(logo.body.replace(/\s+/g, "")).toBe(PNG_BASE64);
    expect(partForFilename(message, "report.csv").headers).toMatch(
      /^content-disposition: attachment/im,
    );
  });

  it("marks non-image files with a contentId inline too", async () => {
    const message = await composeMessage({
      ...baseOptions,
      attachments: [
        {
          filename: "notes.txt",
          content: NOTES_BASE64,
          contentId: "notes",
        },
      ],
    });

    const part = partForFilename(message, "notes.txt");
    expect(part.headers).toMatch(/^content-id: <notes>/im);
    expect(part.headers).toMatch(/^content-disposition: inline/im);
  });

  it("composes a plain message when there are no attachments", async () => {
    const message = await composeMessage(baseOptions);
    expect(message).not.toMatch(/content-disposition/i);
  });
});
