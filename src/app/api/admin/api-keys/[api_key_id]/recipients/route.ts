import "server-only";

import { handle } from "hono/vercel";
import { createApiKeyScopeRouteApp } from "../scope-route-factory";
import { recipientMutationBodySchema } from "../scope-body-schemas";

const app = createApiKeyScopeRouteApp({
  segment: "recipients",
  bodySchema: recipientMutationBodySchema,
  entryFromBody: (body) => body.email,
  expectedBodyShape: "{ email }",
  parseLogNoun: "recipient",
  list: (registry, apiKeyId) => registry.listAllowedRecipientEmails(apiKeyId),
  add: (registry, apiKeyId, entry) =>
    registry.addAllowedRecipientEmail(apiKeyId, entry),
  remove: (registry, apiKeyId, entry) =>
    registry.removeAllowedRecipientEmail(apiKeyId, entry),
  messages: {
    listError: "Failed to list API key allowed recipients!",
    addSuccess: "Added recipient to API key audience allowlist.",
    addError: "Failed to add API key allowed recipient!",
    addFkViolation: "Unknown api_key_id (foreign key violation).",
    removeSuccess: "Removed recipient from API key audience allowlist.",
    removeError: "Failed to remove API key allowed recipient!",
  },
});

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
