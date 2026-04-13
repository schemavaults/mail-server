import { getAppEnvironment } from "@schemavaults/auth-server-sdk";
import { type SendEmailRequestBody, sendEmail } from "@schemavaults/send-email";

export async function sendEmailWithBearerToken(
  body: SendEmailRequestBody,
  bearerToken: string,
  mail_server_url: string = "",
): Promise<void> {
  return await sendEmail({
    body,
    bearerToken,
    environment: getAppEnvironment(),
    mailServerUrl: mail_server_url,
  });
}

export default sendEmailWithBearerToken;
