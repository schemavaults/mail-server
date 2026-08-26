// Seeds the API key the E2E tests authenticate with, by inserting a row
// directly into the API_KEYS table over a plain TCP Postgres connection
// (Bun's built-in SQL client — no Neon ws proxy involved).
//
// The plaintext key comes from E2E_MAIL_SERVER_API_KEY (the same variable
// the tests read). Only its SHA-256 digest is stored, matching
// src/lib/api-keys/hashApiKey.ts. The key is created with
// allow_any_audience = TRUE and no sender/transport scope entries, so it
// may fake-send to the test recipients and read /api/test-emails.
//
// Usage: bun e2e/setup/seed-e2e-api-key.ts
//   E2E_DATABASE_URL or POSTGRES_URL — direct Postgres connection string
//   E2E_MAIL_SERVER_API_KEY          — plaintext key (svlts_mail_pk_...)

import { SQL } from "bun";

// Keep in sync with src/lib/api-keys/API_KEY_PREFIX.ts (not imported here:
// that module graph is "server-only").
const API_KEY_PREFIX = "svlts_mail_pk_";
const API_KEY_DISPLAY_PREFIX_LENGTH = 20;

/** SHA-256 hex digest — mirrors src/lib/api-keys/hashApiKey.ts. */
async function hashApiKey(plaintext: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(plaintext),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const databaseUrl =
  process.env.E2E_DATABASE_URL ?? process.env.POSTGRES_URL ?? null;
if (!databaseUrl) {
  console.error(
    "Set E2E_DATABASE_URL or POSTGRES_URL to a direct Postgres connection string.",
  );
  process.exit(1);
}

const plaintext = process.env.E2E_MAIL_SERVER_API_KEY ?? null;
if (!plaintext || !plaintext.startsWith(API_KEY_PREFIX)) {
  console.error(
    `Set E2E_MAIL_SERVER_API_KEY to the plaintext API key to seed (must start with '${API_KEY_PREFIX}').`,
  );
  process.exit(1);
}

const key_hash = await hashApiKey(plaintext);
const key_prefix = plaintext.slice(0, API_KEY_DISPLAY_PREFIX_LENGTH);
const api_key_id = crypto.randomUUID();
const created_at = Date.now();

const sql = new SQL(databaseUrl);
try {
  await sql`
    INSERT INTO api_keys
      (api_key_id, name, key_hash, key_prefix, created_at,
       created_by_user_id, last_used_at, revoked_at, allow_any_audience)
    VALUES
      (${api_key_id}, 'E2E Test Key', ${key_hash}, ${key_prefix},
       ${created_at}, '00000000-0000-4000-8000-000000000e2e', NULL, NULL, TRUE)
    ON CONFLICT (key_hash) DO UPDATE
      SET revoked_at = NULL, allow_any_audience = TRUE
  `;
  console.log(
    `[seed-e2e-api-key] Seeded API key '${key_prefix}…' (id may differ if the key already existed).`,
  );
} finally {
  await sql.end();
}
