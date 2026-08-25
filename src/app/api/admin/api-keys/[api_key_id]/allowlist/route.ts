import "server-only";

import { handle } from "hono/vercel";
import { createApiKeyScopeRouteApp } from "../scope-route-factory";
import { allowlistMutationBodySchema } from "../scope-body-schemas";

const app = createApiKeyScopeRouteApp({
  segment: "allowlist",
  bodySchema: allowlistMutationBodySchema,
  entryFromBody: (body) => body.mailing_list_id,
  expectedBodyShape: "{ mailing_list_id }",
  parseLogNoun: "allowlist",
  list: (registry, apiKeyId) => registry.listAllowedMailingListIds(apiKeyId),
  add: (registry, apiKeyId, entry) =>
    registry.addAllowedMailingList(apiKeyId, entry),
  remove: (registry, apiKeyId, entry) =>
    registry.removeAllowedMailingList(apiKeyId, entry),
  messages: {
    listError: "Failed to list API key allowlist!",
    addSuccess: "Added mailing list to API key allowlist.",
    addError: "Failed to add API key allowlist entry!",
    addFkViolation:
      "Unknown api_key_id or mailing_list_id (foreign key violation).",
    removeSuccess: "Removed mailing list from API key allowlist.",
    removeError: "Failed to remove API key allowlist entry!",
  },
});

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
