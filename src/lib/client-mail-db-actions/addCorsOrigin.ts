import { getAppId } from "@/lib/getAppId";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { CorsAllowedOrigin } from "@/lib/mail-db/cors-allowed-origins-table";

export async function addCorsOrigin(
  input: { origin: string; description?: string },
  auth: ISchemaVaultsAuthClient,
): Promise<CorsAllowedOrigin> {
  const accessToken = await auth.acquireAccessToken({
    audience: getAppId(),
  });
  const response = await fetch(`/api/admin/cors-origins`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || response.status !== 200) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : "Error response while trying to add allowed CORS origin!";
    throw new Error(message);
  }
  if (typeof body !== "object" || !body) {
    throw new Error("Failed to parse JSON object from response.");
  }
  if (!("success" in body) || !body.success) {
    throw new Error("Failure indicated in response body!");
  }
  if (!("data" in body) || !body.data || typeof body.data !== "object") {
    throw new Error("Expected an object under 'data' in response body!");
  }
  return body.data as CorsAllowedOrigin;
}

export default addCorsOrigin;
