import { z } from "zod";

export const mailingListDefinition = z
  .object({
    mailing_list_id: z.string().uuid(),
    name: z
      .string()
      .min(3, "Mailing list name must be at least 3 character long.")
      .max(64, "Mailing list name may not be longer than 64 characters long"),
    description: z
      .string()
      .min(3, "Mailing list description must be at least 3 character long.")
      .max(
        256,
        "Mailing list description may not be longer than 256 characters long",
      ),
    public: z.boolean(),
    created_at: z.number().nonnegative(),
  })
  .required({
    mailing_list_id: true,
    name: true,
    description: true,
    public: true,
    created_at: true,
  })
  .strict();

export type MailingListDefinition = z.infer<typeof mailingListDefinition>;
