import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type {
  EmailSendLogEntry,
  EmailSendLogStatus,
} from "@/lib/mail-db/email-send-log-table";

export interface ListEmailSendLogParams {
  limit: number;
  offset: number;
  /** Omitted = every outcome. */
  status?: EmailSendLogStatus;
}

/** Reads one page of GET /api/admin/email-send-log (newest first). */
export async function listEmailSendLog(
  params: ListEmailSendLogParams,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<readonly EmailSendLogEntry[]> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const query = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.status !== undefined) query.set("status", params.status);
  const response = await fetch(`/api/admin/email-send-log?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
  if (!response.ok || response.status !== 200) {
    throw new Error("Error response while trying to list the email send log!");
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
  return body.data as readonly EmailSendLogEntry[];
}

export default listEmailSendLog;
