import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type { TransportStatus } from "@/app/api/admin/transports/transport-status-schema";
import type { MailTransportKind } from "@/lib/mail-transport/loadMailTransportConfig";

/**
 * Toggles a transport's runtime kill switch via
 * PATCH /api/admin/transports/:transport_id. Only the
 * test-database-transport supports this; the server rejects every other
 * transport id.
 */
export async function setTransportEnabled(
  transport_id: MailTransportKind,
  enabled: boolean,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<TransportStatus> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const response = await fetch(
    `/api/admin/transports/${encodeURIComponent(transport_id)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      !!body &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : "Error response while trying to update the mail transport!";
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
    throw new Error("Failed to parse transport status from response body!");
  }
  return body.data as TransportStatus;
}

export default setTransportEnabled;
