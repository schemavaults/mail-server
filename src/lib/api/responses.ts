import {
  OperationErrorBodySchema,
  type ResponseDefinition,
} from "@schemavaults/openapi-operations";
import { z } from "@/lib/zod-openapi";

// Response envelopes shared by the operation definitions. Successful JSON
// responses are `{ success: true, ... }`; every error — whether produced by
// the operations runtime (validation, auth) or thrown by a handler via
// ./errors.ts — is the runtime's `{ success: false, error, message }`
// OperationError envelope.

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

/** A 2xx `{ success: true, message }` response. */
export function messageResponse(description: string) {
  return { description, schema: successMessageResponseSchema } as const;
}

/** A 2xx `{ success: true, data }` response. */
export function dataResponse<TData extends z.ZodType>(
  description: string,
  data: TData,
) {
  return { description, schema: successDataResponseSchema(data) } as const;
}

/** A 2xx `{ success: true, data, message }` response. */
export function dataMessageResponse<TData extends z.ZodType>(
  description: string,
  data: TData,
) {
  return {
    description,
    schema: successDataMessageResponseSchema(data),
  } as const;
}

/**
 * Documents the error statuses an operation's handler produces, for
 * spreading into its `responses`:
 *
 *   responses: {
 *     200: dataResponse("...", ...),
 *     ...errorResponses({ 404: "No such key.", 500: "..." }),
 *   },
 *
 * The runtime's own 400/401/403/415/500 responses are merged into the
 * document automatically (`documentRuntimeResponses`); declare a status here
 * only to describe what the HANDLER adds under it.
 */
export function errorResponses<const TStatus extends number>(
  byStatus: Record<TStatus, string>,
): Record<TStatus, ResponseDefinition<typeof OperationErrorBodySchema>> {
  const entries = Object.entries(byStatus) as [string, string][];
  return Object.fromEntries(
    entries.map(([status, description]) => [
      Number(status),
      { description, schema: OperationErrorBodySchema },
    ]),
  ) as Record<TStatus, ResponseDefinition<typeof OperationErrorBodySchema>>;
}
