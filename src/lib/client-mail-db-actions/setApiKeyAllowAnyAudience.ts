import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import updateApiKey from "./updateApiKey";

/**
 * Grants or revokes an API key's permission to send to ANY recipient. With it
 * revoked, the key may only reach its allowlisted mailing lists and recipient
 * addresses — and nobody at all when it has none allowlisted.
 * Resolves to the updated record.
 */
export async function setApiKeyAllowAnyAudience(
  api_key_id: string,
  allow_any_audience: boolean,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<ApiKeyRecord> {
  return await updateApiKey(api_key_id, { allow_any_audience }, auth, app_id);
}

export default setApiKeyAllowAnyAudience;
