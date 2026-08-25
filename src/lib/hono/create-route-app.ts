import { Hono } from "hono";
import { internalServerError, notFoundError } from "./responses";

/**
 * Creates the Hono app backing ONE Next.js route file. Rather than a single
 * catch-all Hono application, every route.ts under src/app/api (plus /docs)
 * constructs its own app via this factory, registers handlers relative to
 * `routePath`, and exports them with `handle(app)` from "hono/vercel":
 *
 *   const app = createRouteApp("/api/mailing-lists/join");
 *   app.post("/", async (c) => ...);
 *   export const POST = handle(app);
 *
 * `routePath` is the route's full URL path in Hono syntax — dynamic Next.js
 * segments map to Hono params (`[api_key_id]` → `:api_key_id`, read with
 * `c.req.param("api_key_id")`).
 *
 * Every app gets the same JSON error envelope for unhandled errors and
 * unmatched paths, so no route can leak a stack trace or an HTML error page.
 */
export function createRouteApp(routePath: string): Hono {
  const app = new Hono().basePath(routePath);

  app.onError((err, c) => {
    console.error(`[${routePath}] Unhandled error: `, err);
    return internalServerError(c);
  });

  app.notFound((c) => notFoundError(c));

  return app;
}

export default createRouteApp;
