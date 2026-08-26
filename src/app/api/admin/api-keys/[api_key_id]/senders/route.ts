import "server-only";

import { handle } from "hono/vercel";
import { createApiKeyScopeRouteApp } from "../scope-route-factory";
import { senderMutationBodySchema } from "../scope-body-schemas";

const app = createApiKeyScopeRouteApp({
  segment: "senders",
  bodySchema: senderMutationBodySchema,
  entryFromBody: (body) => body.sender,
  expectedBodyShape: "{ sender }",
  parseLogNoun: "sender",
  list: (registry, apiKeyId) => registry.listAllowedSenders(apiKeyId),
  add: (registry, apiKeyId, entry) =>
    registry.addAllowedSender(apiKeyId, entry),
  remove: (registry, apiKeyId, entry) =>
    registry.removeAllowedSender(apiKeyId, entry),
  messages: {
    listError: "Failed to list API key allowed senders!",
    addSuccess: "Added sender to API key allowed senders.",
    addError: "Failed to add API key allowed sender!",
    addFkViolation: "Unknown api_key_id (foreign key violation).",
    removeSuccess: "Removed sender from API key allowed senders.",
    removeError: "Failed to remove API key allowed sender!",
  },
});

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
