import {
  Resend,
  type CreateEmailOptions,
  type CreateEmailResponse,
} from "resend";
import loadResendApiKey from "@/lib/ResendApiKey";

export type ISendEmailOptions = CreateEmailOptions;

export async function sendEmail(
  options: ISendEmailOptions,
  resend: Resend = new Resend(loadResendApiKey()),
): Promise<CreateEmailResponse> {
  return await resend.emails.send(options);
}

export default sendEmail;
