import type { Insertable, Selectable } from "@schemavaults/dbh";
import z from "zod";
import { MAIL_TRANSPORT_KINDS } from "@/lib/mail-transport/loadMailTransportConfig";

/**
 * Row schema for the API_KEY_ALLOWED_TRANSPORTS table.
 *
 * Each row permits a single API key to deliver via one configured mail
 * transport ("resend" or "smtp"). A key with zero rows is *unrestricted*
 * (the default for newly issued keys) and may use any configured transport;
 * a key with one or more rows is *transport-restricted* and may only use the
 * listed transports — including when a request omits `transport` and the
 * deployment default is applied.
 */
export const apiKeyAllowedTransportRowSchema = z.object({
  api_key_id: z.string().uuid(),
  transport_id: z.enum(MAIL_TRANSPORT_KINDS),
  created_at: z.number().nonnegative(),
});

export type ApiKeyAllowedTransportsTable = z.infer<
  typeof apiKeyAllowedTransportRowSchema
>;

export type ApiKeyAllowedTransportRow =
  Selectable<ApiKeyAllowedTransportsTable>;
export type NewApiKeyAllowedTransportRow =
  Insertable<ApiKeyAllowedTransportsTable>;
