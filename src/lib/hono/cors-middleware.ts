import "server-only";

import type { MiddlewareHandler } from "hono";
import { applyCorsHeaders, corsPreflightResponse } from "@/lib/cors";

/**
 * Applies the database-backed CORS origin allowlist (managed at /admin/cors)
 * to a public route's Hono app: OPTIONS preflights are answered directly,
 * and every other response gets the allow-origin headers when the caller's
 * Origin is allowlisted.
 *
 * Register it app-wide and remember to export OPTIONS from the route file so
 * Next.js forwards preflights to the Hono app at all:
 *
 *   app.use(corsMiddleware());
 *   ...
 *   export const OPTIONS = handle(app);
 */
export function corsMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.method === "OPTIONS") {
      return await corsPreflightResponse(c.req.raw);
    }
    await next();
    await applyCorsHeaders(c.req.raw, c.res);
  };
}

export default corsMiddleware;
