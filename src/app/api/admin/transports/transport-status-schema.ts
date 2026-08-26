import { z } from "@/lib/zod-openapi";
import { mailTransportKindSchema } from "@/lib/mail-transport/transport-kind-schema";

/**
 * One transport this mail-server knows about. `configured` reflects whether
 * the transport's env vars are present on this deployment; `is_default`
 * marks the transport MAIL_TRANSPORT selects when a send request omits its
 * `transport` property; `enabled` reflects the admin-managed runtime kill
 * switch (currently only the test-database-transport can be disabled —
 * every other transport always reports true). Credentials are never
 * included.
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
    enabled: z.boolean().openapi({
      description:
        "Whether an admin has left this transport enabled at runtime. Only the test-database-transport can currently be disabled (from /admin/transports); a disabled transport rejects sends even when configured.",
    }),
  })
  .openapi("TransportStatus");

export type TransportStatus = z.infer<typeof transportStatusSchema>;
