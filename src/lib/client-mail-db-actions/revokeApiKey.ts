import { SCHEMAVAULTS_MAIL_APP_DEFINITION } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";

export async function revokeApiKey(
  api_key_id: string,
  auth: ISchemaVaultsAuthClient,
): Promise<void> {
  const accessToken = await auth.acquireAccessToken({
    audience: SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id,
  });
  const response = await fetch(
    `/api/admin/api-keys/${encodeURIComponent(api_key_id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
      },
    },
  );
  if (!response.ok || response.status !== 200) {
    let errorMessage = "Error response while trying to revoke API key!";
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
}

export default revokeApiKey;
