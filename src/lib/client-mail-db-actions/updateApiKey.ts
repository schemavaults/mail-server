import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";

/** Fields an admin may change on an existing API key. */
export interface ApiKeyUpdatePatch {
  /** New human-facing label. The key's ID and secret never change. */
  name?: string;
  /**
   * Whether this key may send to ANY recipient. When false, the key can only
   * reach its allowlisted mailing lists and recipient addresses — and nobody
   * at all when it has none.
   */
  allow_any_audience?: boolean;
}

/**
 * Applies an update to an existing API key. The key's ID, secret and scope
 * entries are never touched, so callers already using the key keep working.
 * Resolves to the updated record.
 */
export async function updateApiKey(
  api_key_id: string,
  patch: ApiKeyUpdatePatch,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<ApiKeyRecord> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const response = await fetch(
    `/api/admin/api-keys/${encodeURIComponent(api_key_id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.token}`,
      },
    },
  );
  if (!response.ok || response.status !== 200) {
    let errorMessage = "Error response while trying to update API key!";
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
  return body.data as ApiKeyRecord;
}

export default updateApiKey;
