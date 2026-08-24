import type { Insertable, Selectable } from "@schemavaults/dbh";
import z from "zod";

/**
 * Row schema for the API_KEY_RECIPIENT_ALLOWLISTS table.
 *
 * Each row permits a single API key to target one individual (one-off)
 * recipient email in to/cc/bcc on `/api/send`. Emails are stored lowercase.
 *
 * Rows here and in API_KEY_MAILING_LIST_ALLOWLISTS form ONE combined
 * audience allowlist: a key with a row in either table is
 * *audience-restricted* for both kinds — it may only send to its allowlisted
 * mailing lists and individual recipients.
 */
export const apiKeyRecipientAllowlistRowSchema = z.object({
  api_key_id: z.string().uuid(),
  email: z.string().trim().toLowerCase().email(),
  created_at: z.number().nonnegative(),
});

export type ApiKeyRecipientAllowlistsTable = z.infer<
  typeof apiKeyRecipientAllowlistRowSchema
>;

export type ApiKeyRecipientAllowlistRow =
  Selectable<ApiKeyRecipientAllowlistsTable>;
export type NewApiKeyRecipientAllowlistRow =
  Insertable<ApiKeyRecipientAllowlistsTable>;
