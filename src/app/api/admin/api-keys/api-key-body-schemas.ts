import { z } from "@/lib/zod-openapi";
import { apiKeyNameSchema } from "@/lib/api-keys/api-key-name";

// Request bodies for the admin API-key management routes, shared between the
// Hono apps (./route.ts, ./[api_key_id]/route.ts) and their OpenAPI
// registrations.

export const createApiKeyBodySchema = z
  .object({
    name: apiKeyNameSchema,
  })
  .openapi("CreateApiKeyRequestBody");

/**
 * PATCH body. `name` renames the key (its ID, secret and scopes are
 * untouched); `allow_any_audience` toggles the key's permission to send to
 * ANY recipient, which is off for every newly created key. At least one field
 * must be present, and both may be sent together.
 */
export const updateApiKeyBodySchema = z
  .object({
    name: apiKeyNameSchema.optional(),
    allow_any_audience: z.boolean().optional().openapi({
      description:
        "When true, the key may send to ANY recipient and its audience allowlists are ignored.",
    }),
  })
  .refine(
    (body) => body.name !== undefined || body.allow_any_audience !== undefined,
    {
      message:
        "Nothing to update; expected 'name' and/or 'allow_any_audience'.",
    },
  )
  .openapi("UpdateApiKeyRequestBody");
