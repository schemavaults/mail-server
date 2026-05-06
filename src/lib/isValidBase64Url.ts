/**
 * Returns true iff `value` is a non-empty string composed solely of
 * URL-safe base64 characters (RFC 4648 §5) with no padding. The shape
 * matches the output of `base64UrlEncode`.
 */
export function isValidBase64Url(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]+$/.test(value);
}

export default isValidBase64Url;
