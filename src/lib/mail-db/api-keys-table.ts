import type {
  Insertable,
  Selectable,
  Updateable,
} from "@schemavaults/dbh";
import { z } from "@/lib/zod-openapi";

export const apiKeyTableRowSchema = z.object({
  api_key_id: z.string().uuid(),
  name: z.string().min(1).max(64),
  key_hash: z.string().min(1),
  key_prefix: z.string().min(1),
  created_at: z.number().nonnegative(),
  created_by_user_id: z.string().uuid(),
  last_used_at: z.number().nonnegative().nullable(),
  revoked_at: z.number().nonnegative().nullable(),
  /**
   * When true, this key may send to ANY recipient and its audience
   * allowlists (mailing lists + individual recipients) are ignored. When
   * false — the default for every newly created key — the key may only send
   * to its allowlisted audience entries, and a key with no entries may send
   * to nobody. Keys that predate migration 00011 were grandfathered to true
   * if they had no allowlist entries at the time.
   */
  allow_any_audience: z.boolean(),
});

export type ApiKeysTable = z.infer<typeof apiKeyTableRowSchema>;

export type ApiKey = Selectable<ApiKeysTable>;
export type NewApiKey = Insertable<ApiKeysTable>;
export type ApiKeyUpdate = Updateable<ApiKeysTable>;

/**
 * Public-facing record describing an API key. Never includes the secret hash
 * or the plaintext token; safe to return from admin list endpoints.
 */
export type ApiKeyRecord = Omit<ApiKey, "key_hash">;

/**
 * Schema mirror of {@link ApiKeyRecord}, used by the admin API-key routes'
 * OpenAPI registrations.
 */
export const apiKeyRecordSchema = apiKeyTableRowSchema
  .omit({ key_hash: true })
  .openapi("ApiKeyRecord", {
    description:
      "An API key as returned by the admin endpoints. Never includes the secret hash or the plaintext token.",
  });
