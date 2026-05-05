import "server-only";

import { base64UrlEncode } from "@/lib/base64UrlEncode";
import { hashApiKey } from "@/lib/api-keys/hashApiKey";

export interface GeneratedConfirmationToken {
  /** Plaintext token; only ever returned to the caller once. */
  plaintext: string;
  /** SHA-256 hex digest of the plaintext, suitable for persistence. */
  hash: string;
}

/**
 * Generates a fresh mailing-list confirmation token. The plaintext is the
 * only place the secret material exists; only the hash is persisted. No
 * API-key prefix is applied so confirmation tokens are visually distinct
 * from API keys at a glance.
 */
export async function generateConfirmationToken(): Promise<GeneratedConfirmationToken> {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const plaintext = base64UrlEncode(randomBytes);
  const hash = await hashApiKey(plaintext);
  return { plaintext, hash };
}

export default generateConfirmationToken;
