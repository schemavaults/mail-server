import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { SCHEMAVAULTS_MAIL_APP_ID } from "@/lib/schemavaults-apps";
import type { ISchemaVaultsAuthClient } from "@schemavaults/auth-react-provider";

export async function createMailingList(
  mailing_list: Omit<MailingListDefinition, "mailing_list_id" | "created_at">,
  auth: ISchemaVaultsAuthClient,
): Promise<string> {
  const mailServerBackendAccessToken = await auth.acquireAccessToken({
    audience: SCHEMAVAULTS_MAIL_APP_ID,
  });
  const response = await fetch(`/api/mailing-lists`, {
    method: "POST",
    body: JSON.stringify(mailing_list),
    headers: {
      Authorization: `Bearer ${mailServerBackendAccessToken.token}`,
    },
  });
  if (!response.ok || response.status !== 200) {
    throw new Error("Error response while trying to create mailing list!");
  }
  const body = await response.json();
  if (typeof body !== "object" || !body) {
    throw new Error("Failed to parse JSON object from response object!");
  }
  if (!("success" in body) || !body.success) {
    throw new Error("Failure indicated in response body!");
  }

  if (!("data" in body) || !body.data || typeof body.data !== "object") {
    throw new Error(
      "Expected success response to have a 'data' property object.",
    );
  }
  const data: object = body.data;

  if (
    !("mailing_list_id" in data) ||
    typeof data.mailing_list_id !== "string"
  ) {
    throw new Error(
      "Expected response object to contain a 'mailing_list_id' attribute in the 'data' property!",
    );
  }
  const mailing_list_id: string = data.mailing_list_id;
  return mailing_list_id;
}

export default createMailingList;
