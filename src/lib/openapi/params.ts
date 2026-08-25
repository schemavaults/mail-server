import { z } from "@/lib/zod-openapi";

/**
 * A UUID path parameter (e.g. `{api_key_id}`), for a route's
 * `request.params` object schema.
 */
export function uuidPathParam(name: string, description: string) {
  return z
    .string()
    .uuid()
    .openapi({
      param: { name, in: "path", required: true },
      description,
      example: "b7d1f9c2-4a3e-4d24-9f6b-2f42f8f0a111",
    });
}

/** A UUID query parameter. */
export function uuidQueryParam(name: string, description: string) {
  return z
    .string()
    .uuid()
    .openapi({
      param: { name, in: "query", required: true },
      description,
      example: "b7d1f9c2-4a3e-4d24-9f6b-2f42f8f0a111",
    });
}
