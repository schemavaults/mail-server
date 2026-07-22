import { SCHEMAVAULTS_MAIL_APP_ID } from "@/lib/schemavaults-apps";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";

export async function listApiKeys(
  auth: ISchemaVaultsAuthClient,
): Promise<readonly ApiKeyRecord[]> {
  const accessToken = await auth.acquireAccessToken({
    audience: SCHEMAVAULTS_MAIL_APP_ID,
  });
  const response = await fetch(`/api/admin/api-keys`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
  if (!response.ok || response.status !== 200) {
    throw new Error("Error response while trying to list API keys!");
  }
  const body = await response.json();
  if (typeof body !== "object" || !body) {
    throw new Error("Failed to parse JSON object from response.");
  }
  if (!("success" in body) || !body.success) {
    throw new Error("Failure indicated in response body!");
  }
  if (!("data" in body) || !Array.isArray(body.data)) {
    throw new Error("Expected an array under 'data' in response body!");
  }
  return body.data as readonly ApiKeyRecord[];
}

export default listApiKeys;
