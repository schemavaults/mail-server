import "server-only";

import { Resend, type CreateEmailResponse } from "resend";
import loadResendApiKey from "@/lib/ResendApiKey";
import sendEmail from "@/lib/send-email";
import EmailTemplatesCatalog, {
  isValidTemplateId,
  type EmailTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import type { ReactNode } from "react";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { type SendEmailRequestBody } from "@schemavaults/send-email";

type TemplateMessageDef<T extends EmailTemplateId> =
  SendEmailRequestBody["message"] & { template_id: T };

export type ISendEmailFromTemplateOptions<T extends EmailTemplateId> =
  SendEmailRequestBody & {
    message: TemplateMessageDef<T>;
  };

export async function sendEmailFromTemplate<T extends EmailTemplateId>(
  options: ISendEmailFromTemplateOptions<T>,
  resend: Resend = new Resend(loadResendApiKey()),
): Promise<CreateEmailResponse> {
  if (typeof options.message !== "object") {
    throw new TypeError("Expected 'message' to be an object!");
  }
  const template_details: TemplateMessageDef<T> = options.message;

  const template_id: T = template_details.template_id;
  if (!isValidTemplateId(template_id)) {
    throw new Error("Invalid email template ID!");
  }

  if (typeof options.subject !== "string") {
    throw new TypeError("Missing a 'subject' line for the email to send!");
  }
  const subject: string = options.subject;

  const catalogEntryLoader = EmailTemplatesCatalog[template_id];
  const CatalogEntry = await catalogEntryLoader();
  const template = new CatalogEntry();
  const template_props =
    "template_props" in template_details &&
    typeof template_details.template_props === "object"
      ? template_details.template_props
      : null;

  const isValidTemplateProps: boolean = template.validateProps(template_props);
  if (!isValidTemplateProps) {
    throw new BadEmailTemplatePropsError();
  }

  const rendered: ReactNode = await template.renderTemplate(
    template_props as any,
  );

  const text: string = await template.renderPlainTextVersion(
    template_props as any,
  );

  const from: string =
    options.from ?? "SchemaVaults <noreply@schemavaults.com>";

  return await sendEmail(
    {
      ...options,
      subject,
      react: rendered,
      text,
      from,
    },
    resend,
  );
}

export default sendEmailFromTemplate;
