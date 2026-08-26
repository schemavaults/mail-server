import { NextRequest, NextResponse } from "next/server";
import type { Context } from "hono";

/**
 * Adapts a Hono context's underlying Request to the NextRequest the
 * auth-server-sdk guards expect.
 *
 * The Next.js app-route runtime already hands handlers a NextRequest, so the
 * common path is a pass-through. The one thing this function must never do
 * is `new NextRequest(raw)` on a request that carries a body: constructing a
 * Request FROM another Request proxies the input's body stream, leaving the
 * original's body unusable for the route handler that still has to read it
 * via `c.req` (undici surfaces that later read as "Body is unusable", or as
 * "Cannot read private member #state" on newer versions). Guards only
 * inspect the method, URL, headers, and cookies, so when a wrapper is
 * genuinely needed it is built BODYLESS from those parts instead.
 */
export function toNextRequest(c: Context): NextRequest {
  const raw = c.req.raw;
  if (raw instanceof NextRequest) return raw;
  // Production bundles can duplicate the NextRequest class between the
  // route runtime and app chunks, making the instanceof above miss a
  // request that IS a NextRequest. Detect it structurally rather than
  // re-wrapping (and thereby consuming) a perfectly good request.
  if ("nextUrl" in raw && "cookies" in raw) return raw as NextRequest;
  return new NextRequest(raw.url, {
    method: raw.method,
    headers: raw.headers,
  });
}

/**
 * Adapts any Response to the NextResponse type the auth-server-sdk guard
 * handlers must return. Pass-through when it already is one.
 */
export function toNextResponse(res: Response): NextResponse {
  return res instanceof NextResponse
    ? res
    : new NextResponse(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
}
