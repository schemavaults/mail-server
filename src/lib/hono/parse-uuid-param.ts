import type { Context } from "hono";
import { z } from "@/lib/zod-openapi";
import { badRequest } from "./responses";

const uuidSchema = z.string().uuid();

export type TParsedParam =
  | { ok: true; value: string }
  | { ok: false; response: Response };

/**
 * Validates a UUID-shaped path parameter (e.g. `:api_key_id`), producing the
 * standard `Invalid <name>; must be a valid UUID.` 400 envelope on failure:
 *
 *   const keyId = parseUuidParam(c, "api_key_id");
 *   if (!keyId.ok) return keyId.response;
 */
export function parseUuidParam(c: Context, name: string): TParsedParam {
  const parsed = uuidSchema.safeParse(c.req.param(name));
  if (!parsed.success) {
    return {
      ok: false,
      response: badRequest(c, `Invalid ${name}; must be a valid UUID.`),
    };
  }
  return { ok: true, value: parsed.data };
}

export default parseUuidParam;
