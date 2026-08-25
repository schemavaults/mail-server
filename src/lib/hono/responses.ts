import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

// JSON response envelopes shared by every API route. These mirror the
// OpenAPI response schemas in src/lib/openapi/schemas.ts — change them
// together.

export interface ErrorResponseBody {
  success: false;
  message: string;
}

export interface MessageResponseBody {
  success: true;
  message: string;
}

export interface DataResponseBody<TData> {
  success: true;
  data: TData;
}

export interface DataMessageResponseBody<TData> {
  success: true;
  data: TData;
  message: string;
}

/** `{ success: false, message }` with an arbitrary error status. */
export function jsonError(
  c: Context,
  status: ContentfulStatusCode,
  message: string,
): Response {
  return c.json({ success: false, message } satisfies ErrorResponseBody, status);
}

export function badRequest(c: Context, message = "Invalid request"): Response {
  return jsonError(c, 400, message);
}

export function unauthorized(c: Context, message = "Unauthorized"): Response {
  return jsonError(c, 401, message);
}

export function forbidden(c: Context, message = "Forbidden"): Response {
  return jsonError(c, 403, message);
}

export function notFoundError(c: Context, message = "Not found"): Response {
  return jsonError(c, 404, message);
}

export function internalServerError(
  c: Context,
  message = "An unknown error has occurred!",
): Response {
  return jsonError(c, 500, message);
}

/** `{ success: true, message }` — mutation/no-payload success. */
export function jsonMessage(
  c: Context,
  message: string,
  status: ContentfulStatusCode = 200,
): Response {
  return c.json(
    { success: true, message } satisfies MessageResponseBody,
    status,
  );
}

/** `{ success: true, data }` — read success. */
export function jsonData<TData>(c: Context, data: TData): Response {
  return c.json(
    { success: true, data } satisfies DataResponseBody<TData>,
    200,
  );
}

/** `{ success: true, data, message }` — create/update success. */
export function jsonDataMessage<TData>(
  c: Context,
  data: TData,
  message: string,
): Response {
  return c.json(
    { success: true, data, message } satisfies DataMessageResponseBody<TData>,
    200,
  );
}
