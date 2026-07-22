import { SCHEMAVAULTS_MAIL_APP_ID } from "@/lib/schemavaults-apps";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { SendEmailRequestBody } from "@schemavaults/send-email";
import sendEmailWithBearerToken from "./sendEmailWithBearerToken";

export async function sendEmail(
  body: SendEmailRequestBody,
  auth: ISchemaVaultsAuthClient,
): Promise<void> {
  const mailServerBackendAccessToken = await auth.acquireAccessToken({
    audience: SCHEMAVAULTS_MAIL_APP_ID,
  });
  await sendEmailWithBearerToken(body, mailServerBackendAccessToken.token);
}

export default sendEmail;
