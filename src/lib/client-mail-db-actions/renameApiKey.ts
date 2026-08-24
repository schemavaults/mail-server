import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import updateApiKey from "./updateApiKey";

/**
 * Renames an existing API key. The key's ID and secret never change — only
 * the human-facing label — so callers already using the key keep working.
 * Resolves to the updated record.
 */
export async function renameApiKey(
  api_key_id: string,
  name: string,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<ApiKeyRecord> {
  return await updateApiKey(api_key_id, { name }, auth, app_id);
}

export default renameApiKey;
