import { z } from "@/lib/zod-openapi";

/**
 * Kysely row type for the TEST_EMAILS table, which stores every email
 * "sent" through the fake test-database-transport. The recipient list
 * columns hold JSON-encoded string arrays in TEXT columns (empty array =
 * "[]") so rows round-trip cleanly through the serverless Postgres driver;
 * TestEmailsRegistry is the only reader/writer and (de)serializes them.
 */
export interface TestEmailsTable {
  test_email_id: string;
  from_address: string;
  /** JSON-encoded string[] — never empty. */
  to_addresses: string;
  /** JSON-encoded string[]. */
  cc_addresses: string;
  /** JSON-encoded string[]. */
  bcc_addresses: string;
  /** JSON-encoded string[]. */
  reply_to_addresses: string;
  subject: string;
  html: string | null;
  text: string | null;
  created_at: number;
}

/**
 * One fake-sent email as returned by the /api/test-emails endpoints. The
 * JSON-encoded recipient columns are expanded to real arrays.
 */
export const testEmailSchema = z
  .object({
    test_email_id: z.string().uuid(),
    from_address: z.string().openapi({
      description:
        "The `from` the send was dispatched with (bare address or `Display Name <address>` form).",
      example: "Example <noreply@example.com>",
    }),
    to_addresses: z.array(z.string()).min(1).openapi({
      description: "Recipient addresses, after any mailing-list expansion.",
    }),
    cc_addresses: z.array(z.string()),
    bcc_addresses: z.array(z.string()),
    reply_to_addresses: z.array(z.string()),
    subject: z.string(),
    html: z.string().nullable().openapi({
      description:
        "Rendered HTML body (templates are rendered before the transport runs), or null for text-only sends.",
    }),
    text: z.string().nullable(),
    created_at: z.number().nonnegative().openapi({
      description: "Unix epoch milliseconds when the fake send was stored.",
    }),
  })
  .openapi("TestEmail", {
    description:
      "An email captured by the test-database-transport instead of being delivered. Used to verify /api/send behavior in E2E tests.",
  });

export type TestEmail = z.infer<typeof testEmailSchema>;
