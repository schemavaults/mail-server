import type { Context } from "hono";
import { badRequest } from "./responses";

// Structural stand-in for a zod schema so this helper works with BOTH the
// app's own zod v4 schemas and the zod v3 schema exported by
// @schemavaults/send-email (which bundles its own nested zod copy).
export interface ZodLikeIssue {
  message?: string;
}
export interface ZodLikeError {
  issues: readonly ZodLikeIssue[];
}
export type ZodLikeSafeParseResult<TOut> =
  | { success: true; data: TOut }
  | { success: false; error: ZodLikeError };
export interface ZodLikeSchema<TOut> {
  safeParseAsync(data: unknown): Promise<ZodLikeSafeParseResult<TOut>>;
}

export type TParsedJsonBody<TOut> =
  | { ok: true; data: TOut }
  | { ok: false; response: Response };

export interface IParseJsonBodyOptions {
  /**
   * 400 message when the request body is not a JSON object at all
   * (malformed JSON, or a non-object JSON value).
   */
  malformedMessage?: string;
  /**
   * Fixed 400 message when schema validation fails. When omitted, the first
   * zod issue's message is used, falling back to `fallbackMessage`.
   */
  invalidMessage?: string;
  /** Backup message for first-issue mode when the issue has no message. */
  fallbackMessage?: string;
  /** When set, schema-validation failures are logged under this label. */
  logLabel?: string;
}

/**
 * Reads and validates a JSON request body against a zod schema, producing
 * the standard 400 error envelope on failure:
 *
 *   const body = await parseJsonBody(c, createApiKeyBodySchema);
 *   if (!body.ok) return body.response;
 *   const { name } = body.data;
 */
export async function parseJsonBody<TOut>(
  c: Context,
  schema: ZodLikeSchema<TOut>,
  opts: IParseJsonBodyOptions = {},
): Promise<TParsedJsonBody<TOut>> {
  const malformedMessage =
    opts.malformedMessage ?? "Failed to parse request body!";

  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return { ok: false, response: badRequest(c, malformedMessage) };
  }
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, response: badRequest(c, malformedMessage) };
  }

  const parsed = await schema.safeParseAsync(raw);
  if (!parsed.success) {
    if (opts.logLabel) {
      console.error(`Failed to parse ${opts.logLabel}: `, parsed.error);
    }
    const message =
      opts.invalidMessage ??
      parsed.error.issues[0]?.message ??
      opts.fallbackMessage ??
      "Invalid request body.";
    return { ok: false, response: badRequest(c, message) };
  }

  return { ok: true, data: parsed.data };
}

export default parseJsonBody;
