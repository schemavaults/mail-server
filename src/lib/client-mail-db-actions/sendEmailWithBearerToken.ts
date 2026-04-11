import type { SendEmailRequestBody } from "@schemavaults/send-email-api-options";

export async function sendEmailWithBearerToken(
  body: SendEmailRequestBody,
  bearerToken: string,
  mail_server_url: string = "",
): Promise<void> {
  const endpoint: string = `${mail_server_url}/api/send`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
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
