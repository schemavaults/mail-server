import { z } from "@/lib/zod-openapi";

/**
 * A UUID request parameter (e.g. the `{api_key_id}` path segment or a
 * `?mailing_list_id=` query parameter), for an operation's `request.params`
 * or `request.query` object schema. The runtime validates it before the
 * handler runs (400 `validation_error` otherwise).
 */
export function uuidParam(name: string, description: string) {
  return z
    .string()
    .uuid(`Invalid ${name}; must be a valid UUID.`)
    .openapi({
      description,
      example: "b7d1f9c2-4a3e-4d24-9f6b-2f42f8f0a111",
    });
}
