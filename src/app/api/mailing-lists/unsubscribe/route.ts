import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { parseJsonBody } from "@/lib/hono/parse-json-body";
import { internalServerError, jsonMessage } from "@/lib/hono/responses";
import { leaveMailingListRequestBodySchema } from "./leave-mailing-list-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";

const app = createRouteApp("/api/mailing-lists/unsubscribe");

app.post("/", async (c) => {
  const body = await parseJsonBody(c, leaveMailingListRequestBodySchema, {
    malformedMessage: "Expected request to have JSON body.",
    invalidMessage:
      "Failed to parse request body to unsubscribe from mailing list!",
  });
  if (!body.ok) return body.response;
  const { email, mailing_list_id } = body.data;

  try {
    await using dbh = ServerlessDatabase.getAsyncResource();

    const mailRegistry = new MailingListRegistry(dbh);
    await mailRegistry.leaveMailingList(mailing_list_id, email);
  } catch (e: unknown) {
    console.error("Failed to remove email address from the mailing list: ", e);
    return internalServerError(
      c,
      "Failed to unsubscribe your email address from the mailing list!",
    );
  }

  return jsonMessage(
    c,
    `Successfully unsubscribed from mailing list with ID: '${mailing_list_id}'`,
  );
});

export const POST = handle(app);
