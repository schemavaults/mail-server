import { getAppId } from "@/lib/getAppId";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";

export async function removeCorsOrigin(
  cors_origin_id: string,
  auth: ISchemaVaultsAuthClient,
): Promise<void> {
  const accessToken = await auth.acquireAccessToken({
    audience: getAppId(),
  });
  const response = await fetch(
    `/api/admin/cors-origins/${encodeURIComponent(cors_origin_id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
      },
    },
  );
  if (!response.ok || response.status !== 200) {
    throw new Error("Error response while trying to remove allowed CORS origin!");
  }
  const body = await response.json();
  if (typeof body !== "object" || !body) {
    throw new Error("Failed to parse JSON object from response.");
  }
  if (!("success" in body) || !body.success) {
    throw new Error("Failure indicated in response body!");
  }
}

export default removeCorsOrigin;
