import { z } from "zod";
import isValidBase64Url from "@/lib/isValidBase64Url";

/**
 * Tokens are produced by `generateConfirmationToken()`: 32 random bytes
 * encoded as URL-safe base64 (RFC 4648 §5) with padding stripped, which
 * always yields exactly 43 characters from the alphabet [A-Z a-z 0-9 - _].
 * Validating the exact shape up front rejects obviously malformed input
 * before we hash it and hit the database.
 */
const CONFIRMATION_TOKEN_LENGTH = 43;

export const confirmSubscriptionRequestBodySchema = z
  .object({
    token: z
      .string()
      .length(CONFIRMATION_TOKEN_LENGTH)
      .refine(isValidBase64Url, {
        message: "token must be URL-safe base64",
      }),
    email: z.string().email(),
  })
  .required({ token: true, email: true })
  .strict();

export type ConfirmSubscriptionRequestBody = z.infer<
  typeof confirmSubscriptionRequestBodySchema
>;
