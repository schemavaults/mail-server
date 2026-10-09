// E2E tests for file attachments on /api/send, via the fake-send
// test-database-transport: attachments are POSTed base64-encoded (the
// @schemavaults/send-email wire shape) and must read back from
// GET /api/test-emails/:test_email_id byte for byte. Same setup and skip
// rules as send-roundtrip.test.ts (see e2e/README.md).

import { describe, expect, test } from "bun:test";
import {
  E2E_ENABLED,
  TEST_TRANSPORT_ID,
  findTestEmailBySubject,
  getTestEmail,
  listTestEmails,
  sendEmail,
  uniqueSubject,
} from "./helpers";

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  // getRandomValues fills at most 64 KiB per call.
  for (let offset = 0; offset < length; offset += 65_536) {
    crypto.getRandomValues(bytes.subarray(offset, offset + 65_536));
  }
  return bytes;
}

function toBase64(bytes: Uint8Array | string): string {
  return Buffer.from(bytes).toString("base64");
}

describe.skipIf(!E2E_ENABLED)(
  "E2E: /api/send attachments via the test-database transport",
  () => {
    test("raw send stores every attachment byte for byte, in order", async () => {
      const subject = uniqueSubject("attachments-raw");
      // Every byte value, so any lossy text decoding along the way shows up.
      const binary = new Uint8Array(256).map((_, i) => i);
      const csv = `id,subject\n1,${subject}\n`;
      const png = randomBytes(1024);

      const sendResponse = await sendEmail({
        to: "e2e-attachments@example.com",
        from: "e2e-sender@example.com",
        subject,
        message: {
          html: `<p>${subject}</p><img src="cid:e2e-logo">`,
          text: subject,
        },
        transport: TEST_TRANSPORT_ID,
        attachments: [
          {
            filename: "all-bytes.bin",
            content: toBase64(binary),
            contentType: "application/octet-stream",
          },
          {
            filename: "report.csv",
            content: toBase64(csv),
            contentType: "text/csv; charset=utf-8",
          },
          { filename: "logo.png", content: toBase64(png), contentId: "e2e-logo" },
        ],
      });
      expect(sendResponse.status).toBe(200);

      const listed = await findTestEmailBySubject(subject);
      expect(listed).not.toBeNull();
      // The list endpoint reports metadata only, never the bytes.
      expect(listed!.attachments).toEqual([
        {
          filename: "all-bytes.bin",
          content_type: "application/octet-stream",
          content_id: null,
          size_bytes: 256,
        },
        {
          filename: "report.csv",
          content_type: "text/csv; charset=utf-8",
          content_id: null,
          size_bytes: Buffer.byteLength(csv),
        },
        {
          filename: "logo.png",
          content_type: null,
          content_id: "e2e-logo",
          size_bytes: 1024,
        },
      ]);

      const email = await getTestEmail(listed!.test_email_id);
      expect(email.attachments.map((a) => a.filename)).toEqual([
        "all-bytes.bin",
        "report.csv",
        "logo.png",
      ]);
      const [storedBinary, storedCsv, storedPng] = email.attachments;
      expect(storedBinary!.content).toBe(toBase64(binary));
      expect(Buffer.from(storedCsv!.content, "base64").toString("utf8")).toBe(
        csv,
      );
      expect(storedPng!.content).toBe(toBase64(png));
      expect(storedPng).toMatchObject({
        content_type: null,
        content_id: "e2e-logo",
        size_bytes: 1024,
      });
    });

    test("a multi-megabyte attachment survives the round trip", async () => {
      const subject = uniqueSubject("attachments-large");
      const bytes = randomBytes(3 * 1024 * 1024);

      const sendResponse = await sendEmail({
        to: "e2e-attachments@example.com",
        from: "e2e-sender@example.com",
        subject,
        message: { html: `<p>${subject}</p>`, text: subject },
        transport: TEST_TRANSPORT_ID,
        attachments: [
          {
            filename: "archive.zip",
            content: toBase64(bytes),
            contentType: "application/zip",
          },
        ],
      });
      expect(sendResponse.status).toBe(200);

      const listed = await findTestEmailBySubject(subject);
      expect(listed).not.toBeNull();
      expect(listed!.attachments[0]?.size_bytes).toBe(bytes.length);

      const email = await getTestEmail(listed!.test_email_id);
      expect(email.attachments).toHaveLength(1);
      expect(
        Buffer.from(email.attachments[0]!.content, "base64").equals(
          Buffer.from(bytes),
        ),
      ).toBe(true);
    });

    test("template send carries its attachments through rendering", async () => {
      const subject = uniqueSubject("attachments-template");
      const name = `E2E-Template-${crypto.randomUUID()}`;
      const text = `Attachment for ${name}`;

      const sendResponse = await sendEmail({
        to: "e2e-attachments@example.com",
        from: "e2e-sender@example.com",
        subject,
        message: { template_id: "my-test-email", template_props: { name } },
        transport: TEST_TRANSPORT_ID,
        attachments: [
          {
            filename: "notes.txt",
            content: toBase64(text),
            contentType: "text/plain",
          },
        ],
      });
      expect(sendResponse.status).toBe(200);

      const listed = await findTestEmailBySubject(subject);
      expect(listed).not.toBeNull();
      const email = await getTestEmail(listed!.test_email_id);
      expect(email.html ?? "").toContain(name);
      expect(email.attachments).toEqual([
        {
          filename: "notes.txt",
          content: toBase64(text),
          content_type: "text/plain",
          content_id: null,
          size_bytes: Buffer.byteLength(text),
        },
      ]);
    });

    test("a send without attachments reads back with none", async () => {
      const subject = uniqueSubject("attachments-none");

      const sendResponse = await sendEmail({
        to: "e2e-attachments@example.com",
        from: "e2e-sender@example.com",
        subject,
        message: { html: `<p>${subject}</p>`, text: subject },
        transport: TEST_TRANSPORT_ID,
      });
      expect(sendResponse.status).toBe(200);

      const listed = await findTestEmailBySubject(subject);
      expect(listed).not.toBeNull();
      expect(listed!.attachments).toEqual([]);
      expect((await getTestEmail(listed!.test_email_id)).attachments).toEqual(
        [],
      );
    });

    test("dryRun validates attachments without storing anything", async () => {
      const subject = uniqueSubject("attachments-dry-run");

      const sendResponse = await sendEmail({
        to: "e2e-attachments@example.com",
        from: "e2e-sender@example.com",
        subject,
        message: { html: `<p>${subject}</p>`, text: subject },
        transport: TEST_TRANSPORT_ID,
        dryRun: true,
        attachments: [{ filename: "notes.txt", content: toBase64("dry") }],
      });
      expect(sendResponse.status).toBe(200);

      expect(await findTestEmailBySubject(subject, { attempts: 2 })).toBeNull();
    });

    const invalidAttachmentCases: {
      label: string;
      attachments: unknown[];
    }[] = [
      {
        label: "a filename with a path separator",
        attachments: [{ filename: "../etc/passwd", content: toBase64("x") }],
      },
      {
        label: "content that is not base64",
        attachments: [{ filename: "notes.txt", content: "not base64!" }],
      },
      {
        label: "an unknown attachment property",
        attachments: [
          { filename: "notes.txt", content: toBase64("x"), path: "/etc/passwd" },
        ],
      },
      {
        label: "more than 20 attachments",
        attachments: Array.from({ length: 21 }, (_, i) => ({
          filename: `file-${i}.txt`,
          content: toBase64("x"),
        })),
      },
      { label: "an empty attachments array", attachments: [] },
      {
        label: "a content type carrying a header line break",
        attachments: [
          {
            filename: "notes.txt",
            content: toBase64("x"),
            contentType: 'text/plain; name="x\r\nBcc: e2e-victim@example.com"',
          },
        ],
      },
      {
        label: "a filename with a right-to-left override",
        attachments: [
          {
            // Would display as "invoiceexe.pdf" in a mail client.
            filename: `invoice${String.fromCharCode(0x202e)}fdp.exe`,
            content: toBase64("x"),
          },
        ],
      },
    ];

    for (const { label, attachments } of invalidAttachmentCases) {
      test(`rejects ${label} with 400 before anything is stored`, async () => {
        const subject = uniqueSubject("attachments-invalid");

        const sendResponse = await sendEmail({
          to: "e2e-attachments@example.com",
          from: "e2e-sender@example.com",
          subject,
          message: { html: `<p>${subject}</p>`, text: subject },
          transport: TEST_TRANSPORT_ID,
          attachments: attachments as never,
        });
        expect(sendResponse.status).toBe(400);
        expect(await sendResponse.json()).toMatchObject({
          success: false,
          error: "validation_error",
        });

        expect(
          await findTestEmailBySubject(subject, { attempts: 2 }),
        ).toBeNull();
      });
    }

    test("listing never includes attachment content", async () => {
      const emails = await listTestEmails({ limit: 50 });
      for (const email of emails) {
        for (const attachment of email.attachments) {
          expect(attachment).not.toHaveProperty("content");
        }
      }
    });
  },
);
