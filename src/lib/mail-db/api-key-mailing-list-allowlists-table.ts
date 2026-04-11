import type { Insertable, Selectable } from "@schemavaults/dbh";
import z from "zod";

/**
 * Row schema for the API_KEY_MAILING_LIST_ALLOWLISTS join table.
 *
 * Each row pins a single API key to a single mailing list it is permitted
 * to send to. A key with zero rows in this table is *unrestricted* (the
 * default for newly issued keys); a key with one or more rows is
 * *restricted* and may only send to mailing lists in its allowlist.
 */
export const apiKeyMailingListAllowlistRowSchema = z.object({
  api_key_id: z.string().uuid(),
  mailing_list_id: z.string().uuid(),
  created_at: z.number().nonnegative(),
});

export type ApiKeyMailingListAllowlistsTable = z.infer<
  typeof apiKeyMailingListAllowlistRowSchema
>;

export type ApiKeyMailingListAllowlistRow =
  Selectable<ApiKeyMailingListAllowlistsTable>;
export type NewApiKeyMailingListAllowlistRow =
  Insertable<ApiKeyMailingListAllowlistsTable>;
