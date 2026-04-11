import { SCHEMAVAULTS_MAIL_APP_DEFINITION } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";

/**
 * Removes a mailing list from an API key's allowlist. Idempotent — removing
 * a list that is not in the allowlist resolves successfully.
 */
export async function removeApiKeyAllowlistEntry(
  api_key_id: string,
  mailing_list_id: string,
  auth: ISchemaVaultsAuthClient,
): Promise<void> {
  const accessToken = await auth.acquireAccessToken({
    audience: SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id,
  });
  const response = await fetch(
    `/api/admin/api-keys/${encodeURIComponent(api_key_id)}/allowlist`,
    {
      method: "DELETE",
      body: JSON.stringify({ mailing_list_id }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.token}`,
      },
    },
  );
  if (!response.ok || response.status !== 200) {
    let errorMessage =
      "Error response while trying to remove API key allowlist entry!";
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

export default removeApiKeyAllowlistEntry;
