/**
 * True iff `e` is a Postgres foreign-key violation (SQLSTATE 23503). The
 * neon driver surfaces this as an Error with `code` on the cause; check both
 * shapes defensively. Shared by the admin routes that translate FK failures
 * into 400s (unknown api_key_id / mailing_list_id).
 */
export function isFkViolation(e: unknown): boolean {
  if (typeof e !== "object" || e === null) return false;
  const anyE = e as { code?: unknown; cause?: { code?: unknown } };
  if (anyE.code === "23503") return true;
  if (anyE.cause && anyE.cause.code === "23503") return true;
  return false;
}

export default isFkViolation;
