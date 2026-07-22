import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { BrandingAssetKind } from "@/lib/mail-db/branding-assets-table";

export async function removeBrandingAsset(
  asset_kind: BrandingAssetKind,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<void> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const response = await fetch(`/api/admin/branding/${asset_kind}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || response.status !== 200) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : "Error response while trying to remove branding asset!";
    throw new Error(message);
  }
  if (typeof body !== "object" || !body) {
    throw new Error("Failed to parse JSON object from response.");
  }
  if (!("success" in body) || !body.success) {
    throw new Error("Failure indicated in response body!");
  }
}

export default removeBrandingAsset;
