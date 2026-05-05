import { z } from "zod";

export const confirmSubscriptionRequestBodySchema = z
  .object({
    token: z.string().min(1),
    email: z.string().email(),
  })
  .required({ token: true, email: true })
  .strict();

export type ConfirmSubscriptionRequestBody = z.infer<
  typeof confirmSubscriptionRequestBodySchema
>;
