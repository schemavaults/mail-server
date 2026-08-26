import { z } from "@/lib/zod-openapi";
import { MAIL_TRANSPORT_KINDS } from "./loadMailTransportConfig";

/**
 * Schema for a mail transport id (`resend` | `smtp`). Shared by the /api/send
 * body, the admin transports route, and the API-key transport scope route.
 * Kept out of ./index.ts on purpose — see the note there about the barrel
 * staying import-light.
 */
export const mailTransportKindSchema = z
  .enum(MAIL_TRANSPORT_KINDS)
  .openapi("MailTransportKind", {
    description: "A mail transport this server knows about.",
  });

export default mailTransportKindSchema;
