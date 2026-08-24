import { z } from "zod";

// Shared by the admin API routes, the MailKeysRegistry, and the /admin/keys
// client view (for input validation) — deliberately NOT server-only.

/**
 * A human-facing API key label. Trimmed, non-empty, and short enough to fit
 * the NAME column on the API_KEYS table.
 */
export const apiKeyNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required.")
  .max(64, "Name must be 64 characters or fewer.");

export default apiKeyNameSchema;
