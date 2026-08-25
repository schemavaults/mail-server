import type {
  ResponseConfig,
  ZodRequestBody,
} from "@asteasolutions/zod-to-openapi";
import type { z } from "@/lib/zod-openapi";
import {
  errorResponseSchema,
  successMessageResponseSchema,
} from "./schemas";

// Builders for the repetitive parts of registry.registerPath() calls, so
// each route's openapi.ts stays focused on what is unique about the route.

/** A JSON response with the given schema. */
export function jsonResponse(
  description: string,
  schema: z.ZodType,
): ResponseConfig {
  return {
    description,
    content: { "application/json": { schema } },
  };
}

/** A required JSON request body with the given schema. */
export function jsonRequestBody(
  schema: z.ZodType,
  description?: string,
): ZodRequestBody {
  return {
    description,
    required: true,
    content: { "application/json": { schema } },
  };
}

/** A 2xx `{ success: true, message }` response. */
export function messageResponse(description: string): ResponseConfig {
  return jsonResponse(description, successMessageResponseSchema);
}

/** A single `{ success: false, message }` error response. */
export function errorResponse(description: string): ResponseConfig {
  return jsonResponse(description, errorResponseSchema);
}

/**
 * A responses map of `{ status: errorResponse(description) }` entries, for
 * spreading into a route's `responses`:
 *
 *   responses: {
 *     200: jsonResponse("...", ...),
 *     ...errorResponses({ 400: "Invalid request body.", 500: "..." }),
 *   },
 */
export function errorResponses(
  byStatus: Record<number, string>,
): Record<number, ResponseConfig> {
  return Object.fromEntries(
    Object.entries(byStatus).map(([status, description]) => [
      Number(status),
      errorResponse(description),
    ]),
  );
}
