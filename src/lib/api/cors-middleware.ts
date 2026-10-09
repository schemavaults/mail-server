import "server-only";

import type { MiddlewareHandler } from "hono";
import { applyCorsHeaders, corsPreflightResponse } from "@/lib/cors";

/**
 * Applies the database-backed CORS origin allowlist (managed at /admin/cors)
 * to a public route's operations app: OPTIONS preflights are answered
 * directly, and every other response gets the allow-origin headers when the
 * caller's Origin is allowlisted. Enabled per route with
 * `serveOperations(..., { cors: true })`, which also exports OPTIONS.
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
