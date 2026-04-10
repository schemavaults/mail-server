import "server-only";

/**
 * Hashes a plaintext API key with SHA-256 and returns the lowercase hex
 * digest. Uses the platform Web Crypto API which is available in both
 * Node.js (>=20) and the Edge runtime.
 */
export async function hashApiKey(plaintext: string): Promise<string> {
  const data = new TextEncoder().encode(plaintext);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i] ?? 0;
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

export default hashApiKey;
