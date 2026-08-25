import { z } from "@/lib/zod-openapi";
import { mailTransportKindSchema } from "@/lib/mail-transport/transport-kind-schema";

/**
 * One transport this mail-server knows about. `configured` reflects whether
 * the transport's env vars are present on this deployment; `is_default`
 * marks the transport MAIL_TRANSPORT selects when a send request omits its
 * `transport` property. Credentials are never included.
 */
export const transportStatusSchema = z
  .object({
    id: mailTransportKindSchema,
    configured: z.boolean().openapi({
      description:
        "Whether the transport's env vars are present on this deployment.",
    }),
    is_default: z.boolean().openapi({
      description:
        "Whether MAIL_TRANSPORT selects this transport when a send request omits `transport`.",
    }),
  })
  .openapi("TransportStatus");

export type TransportStatus = z.infer<typeof transportStatusSchema>;
