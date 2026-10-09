import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineApiKeyScopeOperations } from "../scope-operations";
import { recipientMutationBodySchema } from "../scope-body-schemas";

const operations = defineApiKeyScopeOperations({
  segment: "recipients",
  operationIds: {
    list: "listApiKeyRecipients",
    add: "addApiKeyRecipient",
    remove: "removeApiKeyRecipient",
  },
  bodySchema: recipientMutationBodySchema,
  entryFromBody: (body) => body.email,
  entrySchema: z.string().email().openapi({
    description: "An allowlisted individual recipient address.",
  }),
  scopeName: "audience recipient allowlist",
  entryName: "recipient",
  description:
    "Individual-recipient entries and mailing-list entries form ONE combined audience allowlist for the key (unless the key's allow_any_audience flag is set).",
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

export const listApiKeyRecipients = operations.list;
export const addApiKeyRecipient = operations.add;
export const removeApiKeyRecipient = operations.remove;
