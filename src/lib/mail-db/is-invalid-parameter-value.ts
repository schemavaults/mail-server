/**
 * True iff `e` is Postgres refusing a parameter value (SQLSTATE 22023) —
 * how it rejects a time zone name it does not know. The neon driver
 * surfaces the code on the error or on its cause; check both shapes, as
 * is-fk-violation.ts does.
 */
export function isInvalidParameterValue(e: unknown): boolean {
  if (typeof e !== "object" || e === null) return false;
  const anyE = e as { code?: unknown; cause?: { code?: unknown } };
  if (anyE.code === "22023") return true;
  if (anyE.cause && anyE.cause.code === "22023") return true;
  return false;
}

export default isInvalidParameterValue;
