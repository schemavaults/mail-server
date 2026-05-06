import { z } from "zod";

/**
 * Tokens are produced by `generateConfirmationToken()`: 32 random bytes
 * encoded as URL-safe base64 (RFC 4648 §5) with padding stripped, which
 * always yields exactly 43 characters from the alphabet [A-Z a-z 0-9 - _].
 * Validating the exact shape up front rejects obviously malformed input
 * before we hash it and hit the database.
 */
const CONFIRMATION_TOKEN_REGEX = /^[A-Za-z0-9_-]{43}$/;

export const confirmSubscriptionRequestBodySchema = z
  .object({
    token: z.string().regex(CONFIRMATION_TOKEN_REGEX),
    email: z.string().email(),
  })
  .required({ token: true, email: true })
  .strict();

export type ConfirmSubscriptionRequestBody = z.infer<
  typeof confirmSubscriptionRequestBodySchema
>;
