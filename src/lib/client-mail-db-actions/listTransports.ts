import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { TransportStatus } from "@/app/api/admin/transports/transport-status-schema";

export async function listTransports(
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<readonly TransportStatus[]> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const response = await fetch(`/api/admin/transports`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
  if (!response.ok || response.status !== 200) {
    throw new Error("Error response while trying to list mail transports!");
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
  return body.data as readonly TransportStatus[];
}

export default listTransports;
