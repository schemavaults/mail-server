import { type SendEmailRequestBody, sendEmail } from "@schemavaults/send-email";

// The package's sendEmail() needs an absolute mail server URL (it rejects
// an empty or relative one), so in the browser default to this origin.
export async function sendEmailWithBearerToken(
  body: SendEmailRequestBody,
  bearerToken: string,
  mail_server_url: string = window.location.origin,
): Promise<void> {
  return await sendEmail({
    body,
    bearerToken,
    mailServerUrl: mail_server_url,
  });
}

export default sendEmailWithBearerToken;
