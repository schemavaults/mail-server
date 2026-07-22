import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { CorsOriginsRegistry } from "@/lib/mail-db/CorsOriginsRegistry";

/**
 * Allowed CORS origins are configuration data stored in the
 * CORS_ALLOWED_ORIGINS database table (managed by admins at /admin/cors)
 * rather than hardcoded per environment. Lookups fail closed: if the database
 * is unreachable, no CORS headers are emitted.
 */
async function isAllowedOrigin(origin: string | null): Promise<boolean> {
  if (typeof origin !== "string" || origin.length === 0) return false;
  try {
    await using dbh = ServerlessDatabase.getAsyncResource();
    const registry = new CorsOriginsRegistry(dbh);
    return await registry.isAllowedOrigin(origin);
  } catch (e: unknown) {
    console.error("Failed to check CORS origin allowlist: ", e);
    return false;
  }
}

export async function applyCorsHeaders(
  req: NextRequest,
  res: NextResponse,
): Promise<NextResponse> {
  const origin = req.headers.get("origin");
  if (origin && (await isAllowedOrigin(origin))) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.append("Vary", "Origin");
  }
  return res;
}

export async function corsPreflightResponse(
  req: NextRequest,
): Promise<NextResponse> {
  const origin = req.headers.get("origin");
  const headers = new Headers();
  if (origin && (await isAllowedOrigin(origin))) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    const requestedHeaders = req.headers.get(
      "access-control-request-headers",
    );
    headers.set(
      "Access-Control-Allow-Headers",
      requestedHeaders ?? "Content-Type, Authorization",
    );
    headers.set("Access-Control-Max-Age", "86400");
  }
  return new NextResponse(null, { status: 204, headers });
}
