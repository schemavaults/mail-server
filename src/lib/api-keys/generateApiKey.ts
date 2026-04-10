import "server-only";

import {
  API_KEY_DISPLAY_PREFIX_LENGTH,
  API_KEY_PREFIX,
} from "./API_KEY_PREFIX";

/**
 * Encodes a Uint8Array as URL-safe base64 (no padding). RFC 4648 §5.
 */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i] ?? 0;
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export interface GeneratedApiKey {
  /** The full plaintext token; only ever returned to the caller once. */
  plaintext: string;
  /** A short, non-secret prefix used to identify the key in admin UIs. */
  display_prefix: string;
}

/**
 * Generates a fresh API key. The plaintext is the only place the secret
 * material exists; callers must not persist it without hashing first.
 */
export function generateApiKey(): GeneratedApiKey {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const random = base64UrlEncode(randomBytes);
  const plaintext = `${API_KEY_PREFIX}${random}`;
  const display_prefix = plaintext.slice(0, API_KEY_DISPLAY_PREFIX_LENGTH);
  return { plaintext, display_prefix };
}

export default generateApiKey;
