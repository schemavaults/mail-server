import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { SendEmailRequestBody } from "@schemavaults/send-email";
import sendEmailWithBearerToken from "./sendEmailWithBearerToken";

export async function sendEmail(
  body: SendEmailRequestBody,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<void> {
  const mailServerBackendAccessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  await sendEmailWithBearerToken(body, mailServerBackendAccessToken.token);
}

export default sendEmail;
