import { z } from "@/lib/zod-openapi";

export const mailingListDefinition = z
  .object({
    mailing_list_id: z.string().uuid().openapi({
      example: "b7d1f9c2-4a3e-4d24-9f6b-2f42f8f0a111",
    }),
    name: z
      .string()
      .min(3, "Mailing list name must be at least 3 character long.")
      .max(64, "Mailing list name may not be longer than 64 characters long")
      .openapi({ example: "Product updates" }),
    description: z
      .string()
      .min(3, "Mailing list description must be at least 3 character long.")
      .max(
        256,
        "Mailing list description may not be longer than 256 characters long",
      )
      .openapi({ example: "Occasional announcements about new features." }),
    public: z.boolean().openapi({
      description:
        "Whether the list is shown in the public mailing list directory.",
    }),
    created_at: z.number().nonnegative().openapi({
      description: "Creation time as a Unix timestamp in milliseconds.",
    }),
  })
  .required({
    mailing_list_id: true,
    name: true,
    description: true,
    public: true,
    created_at: true,
  })
  .strict()
  .openapi("MailingList");

/**
 * Request body for creating a mailing list: the definition minus the
 * server-generated fields. Shared by the POST /api/mailing-lists route and
 * its OpenAPI registration.
 */
export const createMailingListRequestBodySchema = mailingListDefinition
  .omit({ mailing_list_id: true, created_at: true })
  .openapi("CreateMailingListRequestBody");

export type CreateMailingListRequestBody = z.infer<
  typeof createMailingListRequestBodySchema
>;

export type MailingListDefinition = z.infer<typeof mailingListDefinition>;
