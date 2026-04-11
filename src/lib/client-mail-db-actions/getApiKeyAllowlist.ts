import { SCHEMAVAULTS_MAIL_APP_DEFINITION } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";

/**
 * Fetches the mailing-list allowlist for the given API key. An empty array
 * means the key is unrestricted (can send to any recipient or list).
 */
export async function getApiKeyAllowlist(
  api_key_id: string,
  auth: ISchemaVaultsAuthClient,
): Promise<string[]> {
  const accessToken = await auth.acquireAccessToken({
    audience: SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id,
  });
  const response = await fetch(
    `/api/admin/api-keys/${encodeURIComponent(api_key_id)}/allowlist`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
      },
    },
  );
  if (!response.ok || response.status !== 200) {
    let errorMessage = "Error response while trying to load API key allowlist!";
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
  if (!("data" in body) || !Array.isArray(body.data)) {
    throw new Error("Expected 'data' array in response body!");
  }
  return body.data as string[];
}

export default getApiKeyAllowlist;
