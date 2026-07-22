import { getAppId } from "@/lib/getAppId";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { CorsAllowedOrigin } from "@/lib/mail-db/cors-allowed-origins-table";

export async function listCorsOrigins(
  auth: ISchemaVaultsAuthClient,
): Promise<readonly CorsAllowedOrigin[]> {
  const accessToken = await auth.acquireAccessToken({
    audience: getAppId(),
  });
  const response = await fetch(`/api/admin/cors-origins`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
  if (!response.ok || response.status !== 200) {
    throw new Error("Error response while trying to list allowed CORS origins!");
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
  return body.data as readonly CorsAllowedOrigin[];
}

export default listCorsOrigins;
