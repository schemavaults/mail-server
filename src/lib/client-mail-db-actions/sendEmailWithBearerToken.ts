import {
  type SendEmailRequestBody,
  createSendEmailRequestBodySchema,
} from "@schemavaults/send-email-api-options";

const body_schema = createSendEmailRequestBodySchema(true);

export async function sendEmailWithBearerToken(
  body: SendEmailRequestBody,
  bearerToken: string,
  mail_server_url: string = "",
): Promise<void> {
  const parsed = await body_schema.safeParseAsync(body);
  if (!parsed.success) {
    console.error("Bad request body: ", parsed.error);
    throw new TypeError("Bad request body to send email with!");
  }

  const endpoint: string = `${mail_server_url}/api/send`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(parsed.data satisfies SendEmailRequestBody),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
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

  return;
}

export default sendEmailWithBearerToken;
