import { SCHEMAVAULTS_MAIL_APP_ID } from "@/lib/schemavaults-apps";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";

export interface CreatedApiKey {
  api_key_id: string;
  name: string;
  key_prefix: string;
  /** The plaintext token. The server only returns this once. */
  plaintext: string;
  created_at: number;
  created_by_user_id: string;
}

export async function createApiKey(
  input: { name: string },
  auth: ISchemaVaultsAuthClient,
): Promise<CreatedApiKey> {
  const accessToken = await auth.acquireAccessToken({
    audience: SCHEMAVAULTS_MAIL_APP_ID,
  });
  const response = await fetch(`/api/admin/api-keys`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
  if (!response.ok || response.status !== 200) {
    let errorMessage = "Error response while trying to create API key!";
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
      // ignore
    }
    throw new Error(errorMessage);
  }
  const body = await response.json();
  if (typeof body !== "object" || !body) {
    throw new Error("Failed to parse JSON object from response.");
  }
  if (!("success" in body) || !body.success) {
    throw new Error("Failure indicated in response body!");
  }
  if (!("data" in body) || typeof body.data !== "object" || !body.data) {
    throw new Error("Expected 'data' object in response body!");
  }
  return body.data as CreatedApiKey;
}

export default createApiKey;
