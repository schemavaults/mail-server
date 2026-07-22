import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type {
  BrandingAssetKind,
  BrandingAssetMetadata,
} from "@/lib/mail-db/branding-assets-table";

export async function uploadBrandingAsset(
  input: { asset_kind: BrandingAssetKind; file: File },
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<BrandingAssetMetadata> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const formData = new FormData();
  formData.set("file", input.file);
  const response = await fetch(`/api/admin/branding/${input.asset_kind}`, {
    method: "PUT",
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || response.status !== 200) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : "Error response while trying to upload branding asset!";
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
  return body.data as BrandingAssetMetadata;
}

export default uploadBrandingAsset;
