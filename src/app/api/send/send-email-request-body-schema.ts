import { emailTemplateIdSchema } from "@/lib/EmailTemplatesCatalog";
import { z } from "zod";

const sendEmailTemplateOptions = z
  .object({
    template_id: emailTemplateIdSchema,
    template_props: z.unknown(),
  })
  .required({
    template_id: true,
  })
  .strict();

const sendRawEmailOptions = z
  .object({
    text: z.string().nonempty(),
    html: z.string().nonempty(),
  })
  .required({
    text: true,
    html: true,
  })
  .strict();

const MAX_RECIPIENTS: number = 50;

export const sendEmailRequestBody = z
  .object({
    to: z.union([
      z.string().email(),
      z.string().email().array().min(1).max(MAX_RECIPIENTS),
    ]),
    from: z.string().email().optional(),
    subject: z.string().nonempty(),
    message: z.union([sendEmailTemplateOptions, sendRawEmailOptions]),
    replyTo: z.string().email().optional(),
    cc: z
      .union([
        z.string().email(),
        z.string().email().array().min(1).max(MAX_RECIPIENTS),
      ])
      .optional(),
    bcc: z
      .union([
        z.string().email(),
        z.string().email().array().min(1).max(MAX_RECIPIENTS),
      ])
      .optional(),
  })
  .required({
    to: true,
    message: true,
    subject: true,
  })
  .strict();
