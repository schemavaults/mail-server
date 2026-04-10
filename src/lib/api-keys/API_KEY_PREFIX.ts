/**
 * Prefix that identifies a SchemaVaults Mail Server public API key.
 * The full key shape is `${API_KEY_PREFIX}${random}`.
 */
export const API_KEY_PREFIX = "svlts_mail_pk_" as const;

/**
 * Number of characters of a plaintext key that we store in the `key_prefix`
 * column for UI identification. Includes the `svlts_mail_pk_` prefix plus a
 * few characters of the random body.
 */
export const API_KEY_DISPLAY_PREFIX_LENGTH = 20;
