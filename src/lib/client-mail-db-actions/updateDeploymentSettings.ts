import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { DeploymentSettings } from "@/lib/mail-db/deployment-settings-table";
import type { UpdateDeploymentSettingsRequestBody } from "@/app/api/admin/settings/update-settings-body-schema";

/** Changes deployment settings via PATCH /api/admin/settings. */
export async function updateDeploymentSettings(
  update: UpdateDeploymentSettingsRequestBody,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<DeploymentSettings> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const response = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(update),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      !!body &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : "Error response while trying to save the deployment settings!";
    throw new Error(message);
  }
  if (
    typeof body !== "object" ||
    !body ||
    !("success" in body) ||
    !body.success ||
    !("data" in body) ||
    typeof body.data !== "object" ||
    !body.data
  ) {
    throw new Error("Failed to parse the deployment settings from response!");
  }
  return body.data as DeploymentSettings;
}

export default updateDeploymentSettings;
