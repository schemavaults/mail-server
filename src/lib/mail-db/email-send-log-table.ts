import { z } from "@/lib/zod-openapi";

/** Outcomes a send attempt can be logged with. */
export const EMAIL_SEND_LOG_STATUSES = ["delivered", "failed"] as const;
export type EmailSendLogStatus = (typeof EMAIL_SEND_LOG_STATUSES)[number];

/**
 * Kysely row type for the EMAIL_SEND_LOG table: one row per outbound send
 * attempt. Records only the outcome of the attempt — never the message's
 * subject, body, attachments, or addresses. EmailSendLogRegistry is the only
 * reader/writer.
 */
export interface EmailSendLogTable {
  email_send_log_id: string;
  /** Null when no transport could be resolved for the attempt. */
  transport: string | null;
  status: EmailSendLogStatus;
  attempted_at: number;
  /** When the transport accepted the message; null for failed attempts. */
  delivered_at: number | null;
  /** Why the attempt failed; null for delivered attempts. */
  error_message: string | null;
  provider_message_id: string | null;
  /** The API key that requested the send; null for admin/internal sends. */
  api_key_id: string | null;
}

export const emailSendLogStatusSchema = z
  .enum(EMAIL_SEND_LOG_STATUSES)
  .openapi("EmailSendLogStatus", {
    description:
      "`delivered` when the transport accepted the message, `failed` when the send threw.",
  });

/** One send attempt as listed by GET /api/admin/email-send-log. */
export const emailSendLogEntrySchema = z
  .object({
    email_send_log_id: z.string().uuid(),
    transport: z.string().nullable().openapi({
      description:
        "The transport the send was dispatched through, or null when no transport could be resolved (e.g. a misconfigured MAIL_TRANSPORT).",
      example: "resend",
    }),
    status: emailSendLogStatusSchema,
    attempted_at: z.number().nonnegative().openapi({
      description: "Unix epoch milliseconds when the send was attempted.",
    }),
    delivered_at: z.number().nonnegative().nullable().openapi({
      description:
        "Unix epoch milliseconds when the transport accepted the message for delivery, or null when the send failed.",
    }),
    error_message: z.string().nullable().openapi({
      description:
        "Why the send failed, or null when it was delivered. Long messages are truncated.",
    }),
    provider_message_id: z.string().nullable().openapi({
      description:
        "The message ID the transport reported for a delivered send (e.g. the Resend email ID), if any.",
    }),
    api_key_id: z.string().uuid().nullable().openapi({
      description:
        "The API key that requested the send, or null for sends made by an admin or by the server itself (e.g. subscription confirmation emails).",
    }),
    api_key_name: z.string().nullable().openapi({
      description:
        "The current name of the API key in `api_key_id`, or null when there is none.",
    }),
  })
  .openapi("EmailSendLogEntry", {
    description:
      "One outbound send attempt. Records only when the email was delivered (or why it failed) — never its subject, body, attachments, or addresses.",
  });

export type EmailSendLogEntry = z.infer<typeof emailSendLogEntrySchema>;
