import type { ApiServerId } from "@schemavaults/app-definitions";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";
import type {
  EmailSendStats,
  EmailSendStatsGranularity,
} from "@/lib/mail-db/email-send-stats";

export interface GetEmailSendStatsParams {
  /** Start of the range (inclusive), epoch milliseconds. */
  from: number;
  /** End of the range (exclusive), epoch milliseconds. */
  to: number;
  /** IANA time zone the buckets are aligned to. */
  timezone: string;
  granularity: EmailSendStatsGranularity;
}

/** Reads GET /api/admin/email-send-stats for one range. */
export async function getEmailSendStats(
  params: GetEmailSendStatsParams,
  auth: ISchemaVaultsAuthClient,
  app_id: ApiServerId,
): Promise<EmailSendStats> {
  const accessToken = await auth.acquireAccessToken({
    audience: app_id,
  });
  const query = new URLSearchParams({
    from: String(params.from),
    to: String(params.to),
    timezone: params.timezone,
    granularity: params.granularity,
  });
  const response = await fetch(`/api/admin/email-send-stats?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok || response.status !== 200) {
    // Surface the server's message (e.g. a range spanning too many buckets).
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : "Error response while trying to load email send stats!";
    throw new Error(message);
  }
  if (typeof body !== "object" || !body) {
    throw new Error("Failed to parse JSON object from response.");
  }
  if (!("success" in body) || !body.success) {
    throw new Error("Failure indicated in response body!");
  }
  if (!("data" in body) || typeof body.data !== "object" || !body.data) {
    throw new Error("Expected an object under 'data' in response body!");
  }
  return body.data as EmailSendStats;
}

export default getEmailSendStats;
