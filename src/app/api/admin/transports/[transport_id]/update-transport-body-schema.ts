import { z } from "@/lib/zod-openapi";

export const updateTransportBodySchema = z
  .object({
    enabled: z.boolean().openapi({
      description:
        "Whether the transport may be used for sends. Only supported for the test-database-transport.",
    }),
  })
  .openapi("UpdateTransportRequestBody");

export type UpdateTransportBody = z.infer<typeof updateTransportBodySchema>;
