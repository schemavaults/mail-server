// E2E round-trip tests for /api/send via the fake-send
// test-database-transport: POST /api/send against a RUNNING mail-server,
// then read the captured email back through GET /api/test-emails and
// GET /api/test-emails/:test_email_id. No real SMTP/Resend delivery is
// involved at any point.
//
// These tests only run when E2E_MAIL_SERVER_BASE_URL is set (see
// e2e/README.md for the required server setup); a plain `bun test` skips
// them so the unit suite stays self-contained. Authentication uses the
// mail-server API key from E2E_MAIL_SERVER_API_KEY, seeded by
// e2e/setup/seed-e2e-api-key.ts.

import { describe, expect, test } from "bun:test";
import {
  E2E_ENABLED,
  DEFAULT_TRANSPORT_IS_TEST_DATABASE,
  TEST_TRANSPORT_ID,
  apiRequest,
  findTestEmailBySubject,
  getTestEmail,
  listTestEmails,
  sendEmail,
  uniqueSubject,
} from "./helpers";

describe.skipIf(!E2E_ENABLED)(
  "E2E: /api/send round-trip via the test-database transport",
  () => {
    test("raw html/text send is captured with all envelope fields intact", async () => {
      const subject = uniqueSubject("raw-send");
      const html = `<p>E2E raw body for ${subject}</p>`;
      const text = `E2E raw body for ${subject}`;

      const sendResponse = await sendEmail({
        to: ["e2e-recipient@example.com", "e2e-recipient-2@example.com"],
        from: "e2e-sender@example.com",
        replyTo: "e2e-reply-to@example.com",
        cc: "e2e-cc@example.com",
        bcc: ["e2e-bcc@example.com"],
        subject,
        message: { html, text },
        transport: TEST_TRANSPORT_ID,
      });
      expect(sendResponse.status).toBe(200);
      const sendBody = await sendResponse.json();
      expect(sendBody).toMatchObject({ success: true });

      const listed = await findTestEmailBySubject(subject);
      expect(listed).not.toBeNull();

      // Read the same email back by ID and check the full round-trip.
      const email = await getTestEmail(listed!.test_email_id);
      expect(email).toMatchObject({
        test_email_id: listed!.test_email_id,
        from_address: "e2e-sender@example.com",
        to_addresses: [
          "e2e-recipient@example.com",
          "e2e-recipient-2@example.com",
        ],
        cc_addresses: ["e2e-cc@example.com"],
        bcc_addresses: ["e2e-bcc@example.com"],
        reply_to_addresses: ["e2e-reply-to@example.com"],
        subject,
        html,
        text,
      });
      expect(typeof email.created_at).toBe("number");
      expect(email.created_at).toBeGreaterThan(0);
    });

    test("template send is rendered server-side before being captured", async () => {
      const subject = uniqueSubject("template-send");
      const name = `E2E-Template-${crypto.randomUUID()}`;

      const sendResponse = await sendEmail({
        to: "e2e-template@example.com",
        from: "e2e-sender@example.com",
        subject,
        message: {
          template_id: "my-test-email",
          template_props: { name },
        },
        transport: TEST_TRANSPORT_ID,
      });
      expect(sendResponse.status).toBe(200);

      const listed = await findTestEmailBySubject(subject);
      expect(listed).not.toBeNull();
      const email = await getTestEmail(listed!.test_email_id);

      expect(email.to_addresses).toEqual(["e2e-template@example.com"]);
      // The react-email template must have been rendered to HTML (and a
      // plain-text alternative) before the transport stored it.
      expect(email.html ?? "").toContain(name);
      expect(email.text ?? "").toContain(name);
    });

    test.skipIf(!DEFAULT_TRANSPORT_IS_TEST_DATABASE)(
      "a send omitting `transport` uses the deployment default (test-database in E2E)",
      async () => {
        const subject = uniqueSubject("default-transport");

        const sendResponse = await sendEmail({
          to: "e2e-default@example.com",
          from: "e2e-sender@example.com",
          subject,
          message: {
            html: `<p>${subject}</p>`,
            text: subject,
          },
        });
        expect(sendResponse.status).toBe(200);

        const listed = await findTestEmailBySubject(subject);
        expect(listed).not.toBeNull();
      },
    );

    test("dryRun validates without storing a test email", async () => {
      const subject = uniqueSubject("dry-run");

      const sendResponse = await sendEmail({
        to: "e2e-dry-run@example.com",
        from: "e2e-sender@example.com",
        subject,
        message: {
          html: `<p>${subject}</p>`,
          text: subject,
        },
        transport: TEST_TRANSPORT_ID,
        dryRun: true,
      });
      expect(sendResponse.status).toBe(200);

      const listed = await findTestEmailBySubject(subject, { attempts: 2 });
      expect(listed).toBeNull();
    });

    test("list endpoint paginates and orders newest first", async () => {
      const subjectA = uniqueSubject("ordering-a");
      const subjectB = uniqueSubject("ordering-b");
      for (const subject of [subjectA, subjectB]) {
        const res = await sendEmail({
          to: "e2e-ordering@example.com",
          from: "e2e-sender@example.com",
          subject,
          message: { html: `<p>${subject}</p>`, text: subject },
          transport: TEST_TRANSPORT_ID,
        });
        expect(res.status).toBe(200);
      }

      const emails = await listTestEmails({ limit: 10 });
      const indexA = emails.findIndex((email) => email.subject === subjectA);
      const indexB = emails.findIndex((email) => email.subject === subjectB);
      expect(indexA).toBeGreaterThanOrEqual(0);
      expect(indexB).toBeGreaterThanOrEqual(0);
      // B was sent after A, so it must appear first (newest-first order).
      expect(indexB).toBeLessThan(indexA);

      const limited = await listTestEmails({ limit: 1 });
      expect(limited.length).toBe(1);
    });

    test("reading an unknown test email id returns 404", async () => {
      const response = await apiRequest(
        `/api/test-emails/${crypto.randomUUID()}`,
      );
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toMatchObject({ success: false });
    });

    test("an invalid limit is rejected with 400", async () => {
      const response = await apiRequest(`/api/test-emails?limit=0`);
      expect(response.status).toBe(400);
    });

    test("an invalid API key is rejected with 401", async () => {
      const response = await apiRequest(`/api/test-emails`, {
        bearerToken: "svlts_mail_pk_this-key-does-not-exist",
      });
      expect(response.status).toBe(401);
    });
  },
);
