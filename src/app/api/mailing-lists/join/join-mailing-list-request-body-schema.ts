import { z } from "@/lib/zod-openapi";

export const joinMailingListRequestBodySchema = z
  .object({
    email: z.string().email().openapi({
      description: "Email address to subscribe.",
      example: "subscriber@example.com",
    }),
    mailing_list_id: z.string().uuid().openapi({
      description: "ID of the mailing list to join.",
      example: "b7d1f9c2-4a3e-4d24-9f6b-2f42f8f0a111",
    }),
  })
  .required({ email: true, mailing_list_id: true })
  .strict()
  .openapi("JoinMailingListRequestBody", {
    description:
      "Starts a double-opt-in subscription: a confirmation email is sent to the address before it is added to the list.",
  });
