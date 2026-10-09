import { z } from "@/lib/zod-openapi";
import { corsOriginValueSchema } from "@/lib/mail-db/cors-allowed-origins-table";

/**
 * Request body for allowing a new CORS origin, validated by the operations
 * runtime and documented from the same schema.
 */
export const addCorsOriginBodySchema = z
  .object({
    origin: corsOriginValueSchema,
    description: z
      .string()
      .max(255, "Description must be 255 characters or fewer.")
      .optional()
      .openapi({
        description: "Optional human-readable note about the origin.",
      }),
  })
  .openapi("AddCorsOriginRequestBody");
