import { Resend, type CreateEmailResponse } from "resend";
import loadResendApiKey from "@/lib/ResendApiKey";
import sendEmail, { type ISendEmailOptions } from "@/lib/send-email";
import EmailTemplatesCatalog, {
  isValidTemplateId,
  type EmailTemplateId,
  type EmailTemplatePropsType,
} from "@/lib/EmailTemplatesCatalog";
import type { ReactNode } from "react";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";

export interface ISendEmailFromTemplateOptions<
  T extends EmailTemplateId,
> extends Omit<ISendEmailOptions, "react" | "text" | "html"> {
  template_id: T;
  template_props: EmailTemplatePropsType<T>;
}

export async function sendEmailFromTemplate<T extends EmailTemplateId>(
  options: ISendEmailFromTemplateOptions<T>,
  resend: Resend = new Resend(loadResendApiKey()),
): Promise<CreateEmailResponse> {
  const template_id: T = options.template_id;
  if (!isValidTemplateId(template_id)) {
    throw new Error("Invalid email template ID!");
  }

  const catalogEntryLoader = EmailTemplatesCatalog[template_id];
  const CatalogEntry = await catalogEntryLoader();
  const template = new CatalogEntry();
  const template_props = options.template_props;

  const isValidTemplateProps: boolean = template.validateProps(template_props);
  if (!isValidTemplateProps) {
    throw new BadEmailTemplatePropsError();
  }

  const rendered: ReactNode = await template.renderTemplate(
    template_props satisfies EmailTemplatePropsType<T> as any,
  );

  const text: string = await template.renderPlainTextVersion(
    template_props satisfies EmailTemplatePropsType<T> as any,
  );

  return await sendEmail(
    {
      ...options,
      react: rendered,
      text,
    },
    resend,
  );
}

export default sendEmailFromTemplate;
