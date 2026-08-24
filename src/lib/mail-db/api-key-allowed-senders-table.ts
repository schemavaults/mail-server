import type { Insertable, Selectable } from "@schemavaults/dbh";
import z from "zod";
import { allowedSenderEntrySchema } from "@/lib/api-keys/sender-scope";

/**
 * Row schema for the API_KEY_ALLOWED_SENDERS table.
 *
 * Each row permits a single API key to send `from` one sender entry: a
 * lowercase email address, or a `*@domain` wildcard matching any local part
 * at that domain. A key with zero rows is *unrestricted* (the default for
 * newly issued keys) and may pass any `from`; a key with one or more rows is
 * *sender-restricted* and its `from` and `replyTo` must match an entry.
 */
export const apiKeyAllowedSenderRowSchema = z.object({
  api_key_id: z.string().uuid(),
  sender: allowedSenderEntrySchema,
  created_at: z.number().nonnegative(),
});

export type ApiKeyAllowedSendersTable = z.infer<
  typeof apiKeyAllowedSenderRowSchema
>;

export type ApiKeyAllowedSenderRow = Selectable<ApiKeyAllowedSendersTable>;
export type NewApiKeyAllowedSenderRow = Insertable<ApiKeyAllowedSendersTable>;
