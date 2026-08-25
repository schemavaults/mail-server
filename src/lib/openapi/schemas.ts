import { z } from "@/lib/zod-openapi";

// Reusable OpenAPI response-envelope schemas. These mirror the runtime
// response helpers in src/lib/hono/responses.ts — change them together.

/** `{ success: false, message }` — the error envelope every API route uses. */
export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
  })
  .openapi("ErrorResponse", {
    description: "Error envelope returned by every non-2xx response.",
  });

/** `{ success: true, message }` — mutation/no-payload success envelope. */
export const successMessageResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
  })
  .openapi("SuccessMessageResponse", {
    description: "Success envelope for operations with no response payload.",
  });

/** `{ success: true, data }` — read success envelope around `data`. */
export function successDataResponseSchema<TData extends z.ZodType>(
  data: TData,
) {
  return z.object({
    success: z.literal(true),
    data,
  });
}

/** `{ success: true, data, message }` — create/update success envelope. */
export function successDataMessageResponseSchema<TData extends z.ZodType>(
  data: TData,
) {
  return z.object({
    success: z.literal(true),
    data,
    message: z.string(),
  });
}
