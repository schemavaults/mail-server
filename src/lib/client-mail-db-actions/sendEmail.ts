import { SCHEMAVAULTS_MAIL_APP_DEFINITION } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { SendEmailRequestBody } from "@schemavaults/send-email-api-options";

export async function sendEmail(
  body: SendEmailRequestBody,
  auth: ISchemaVaultsAuthClient,
): Promise<void> {
  const mailServerBackendAccessToken = await auth.acquireAccessToken({
    audience: SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id,
  });
  const response = await fetch(`/api/send`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${mailServerBackendAccessToken.token}`,
    },
  });
  if (!response.ok || response.status !== 200) {
    let errorMessage = "Error response while trying to send email!";
    try {
      const errBody = await response.json();
      if (
        typeof errBody === "object" &&
        !!errBody &&
        "message" in errBody &&
        typeof errBody.message === "string"
      ) {
        errorMessage = errBody.message;
      }
    } catch {
      // ignore JSON parse failure, fall back to default
    }
    throw new Error(errorMessage);
  }
  const responseBody = await response.json();
  if (typeof responseBody !== "object" || !responseBody) {
    throw new Error("Failed to parse JSON object from response object!");
  }
  if (!("success" in responseBody) || !responseBody.success) {
    throw new Error("Failure indicated in response body!");
  }
}

export default sendEmail;
