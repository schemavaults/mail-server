import { z } from "@/lib/zod-openapi";

/**
 * Kysely row type for the TEST_EMAIL_ATTACHMENTS table: one row per file
 * attached to an email captured by the fake test-database-transport.
 * TestEmailsRegistry is the only reader/writer.
 */
export interface TestEmailAttachmentsTable {
  test_email_id: string;
  /** Position in the send request's `attachments` array (0-based). */
  attachment_index: number;
  filename: string;
  /** As the sender passed it; null when omitted. */
  content_type: string | null;
  /** As the sender passed it; null for regular (non-inline) attachments. */
  content_id: string | null;
  /** Decoded size of `content_base64`, in bytes. */
  size_bytes: number;
  content_base64: string;
}

/**
 * One captured attachment without its content, as listed by
 * GET /api/test-emails (which never ships attachment bytes; read one email
 * by ID for those).
 */
export const testEmailAttachmentMetadataSchema = z
  .object({
    filename: z.string(),
    content_type: z.string().nullable().openapi({
      description:
        "The MIME type exactly as the sender passed it, or null when it was omitted (the real transports derive it from the filename).",
      example: "application/pdf",
    }),
    content_id: z.string().nullable().openapi({
      description:
        "The Content-ID of an inline attachment (referenced from the HTML as `cid:<content_id>`), or null for a regular attachment.",
    }),
    size_bytes: z.number().int().nonnegative().openapi({
      description: "Decoded size of the attachment, in bytes.",
    }),
  })
  .openapi("TestEmailAttachmentMetadata", {
    description:
      "A file attached to an email captured by the test-database-transport, without its content.",
  });

export type TestEmailAttachmentMetadata = z.infer<
  typeof testEmailAttachmentMetadataSchema
>;

/** One captured attachment including its content. */
export const testEmailAttachmentSchema = testEmailAttachmentMetadataSchema
  .extend({
    content: z.string().openapi({
      description: "The attachment's bytes, base64-encoded.",
    }),
  })
  .openapi("TestEmailAttachment", {
    description:
      "A file attached to an email captured by the test-database-transport, including its base64-encoded content.",
  });

export type TestEmailAttachment = z.infer<typeof testEmailAttachmentSchema>;
