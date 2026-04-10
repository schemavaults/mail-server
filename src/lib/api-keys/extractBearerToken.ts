import type { NextRequest } from "next/server";

/**
 * Pulls the bearer token off the `Authorization` header. Returns `null` if
 * the header is missing or doesn't follow the `Bearer <token>` format.
 */
export function extractBearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || typeof match[1] !== "string") return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

export default extractBearerToken;
