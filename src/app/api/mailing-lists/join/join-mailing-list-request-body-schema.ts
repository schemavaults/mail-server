import { z } from "zod";

export const joinMailingListRequestBodySchema = z
  .object({
    email: z.string().email(),
    mailing_list_id: z.string().uuid(),
  })
  .required({ email: true, mailing_list_id: true })
  .strict();
