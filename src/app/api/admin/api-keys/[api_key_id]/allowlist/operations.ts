import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineApiKeyScopeOperations } from "../scope-operations";
import { allowlistMutationBodySchema } from "../scope-body-schemas";

const operations = defineApiKeyScopeOperations({
  segment: "allowlist",
  operationIds: {
    list: "listApiKeyAllowlist",
    add: "addApiKeyAllowlistEntry",
    remove: "removeApiKeyAllowlistEntry",
  },
  bodySchema: allowlistMutationBodySchema,
  entryFromBody: (body) => body.mailing_list_id,
  entrySchema: z.string().uuid().openapi({
    description: "An allowlisted mailing list ID.",
  }),
  scopeName: "audience mailing-list allowlist",
  entryName: "mailing list",
  description:
    "Mailing-list entries and individual-recipient entries form ONE combined audience allowlist for the key (unless the key's allow_any_audience flag is set).",
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

export const listApiKeyAllowlist = operations.list;
export const addApiKeyAllowlistEntry = operations.add;
export const removeApiKeyAllowlistEntry = operations.remove;
