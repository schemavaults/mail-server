import { z } from "zod";

export const sendEmailRequestBody = z
  .object({
    recipient: z.string().email(),
    sender: z.string().email(),
    title: z.string(),
  })
  .required()
  .strict();
