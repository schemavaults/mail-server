import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";

/**
 * The three per-key scope dimensions added alongside the original
 * mailing-list allowlist (which keeps its own dedicated actions):
 * - "senders": allowed `from`/`replyTo` entries (email or `*@domain`)
 * - "recipients": individual recipient emails in the audience allowlist
 * - "transports": allowed mail transport ids ("resend", "smtp")
 */
export type ApiKeyScopeDimension = "senders" | "recipients" | "transports";

const SCOPE_BODY_FIELD: Record<ApiKeyScopeDimension, string> = {
  senders: "sender",
  recipients: "email",
  transports: "transport_id",
};

async function extractErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const errBody = await response.json();
    if (
      typeof errBody === "object" &&
      !!errBody &&
      "message" in errBody &&
      typeof errBody.message === "string"
    ) {
      return errBody.message;
    }
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * Fetches one scope dimension's entries for the given API key. An empty
 * array means the key is unrestricted on that dimension.
 */
export async function getApiKeyScopeEntries(
  api_key_id: string,
  scope: ApiKeyScopeDimension,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<string[]> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const response = await fetch(
    `/api/admin/api-keys/${encodeURIComponent(api_key_id)}/${scope}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
      },
    },
  );
  if (!response.ok || response.status !== 200) {
    throw new Error(
      await extractErrorMessage(
        response,
        `Error response while trying to load API key ${scope}!`,
      ),
    );
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

async function mutateApiKeyScopeEntry(
  method: "POST" | "DELETE",
  api_key_id: string,
  scope: ApiKeyScopeDimension,
  value: string,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<void> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const response = await fetch(
    `/api/admin/api-keys/${encodeURIComponent(api_key_id)}/${scope}`,
    {
      method,
      body: JSON.stringify({ [SCOPE_BODY_FIELD[scope]]: value }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.token}`,
      },
    },
  );
  if (!response.ok || response.status !== 200) {
    throw new Error(
      await extractErrorMessage(
        response,
        `Error response while trying to update API key ${scope}!`,
      ),
    );
  }
}

/** Adds one entry to a scope dimension. Idempotent. */
export async function addApiKeyScopeEntry(
  api_key_id: string,
  scope: ApiKeyScopeDimension,
  value: string,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<void> {
  await mutateApiKeyScopeEntry("POST", api_key_id, scope, value, auth, app_id);
}

/** Removes one entry from a scope dimension. Idempotent. */
export async function removeApiKeyScopeEntry(
  api_key_id: string,
  scope: ApiKeyScopeDimension,
  value: string,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<void> {
  await mutateApiKeyScopeEntry(
    "DELETE",
    api_key_id,
    scope,
    value,
    auth,
    app_id,
  );
}
