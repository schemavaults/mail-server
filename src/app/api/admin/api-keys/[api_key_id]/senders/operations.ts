import "server-only";

import { defineApiKeyScopeOperations } from "../scope-operations";
import { senderMutationBodySchema } from "../scope-body-schemas";
import { allowedSenderEntrySchema } from "@/lib/api-keys/sender-scope";

const operations = defineApiKeyScopeOperations({
  segment: "senders",
  operationIds: {
    list: "listApiKeySenders",
    add: "addApiKeySender",
    remove: "removeApiKeySender",
  },
  bodySchema: senderMutationBodySchema,
  entryFromBody: (body) => body.sender,
  entrySchema: allowedSenderEntrySchema,
  scopeName: "allowed-senders scope",
  entryName: "sender",
  description:
    "With zero entries the sender dimension is unrestricted; otherwise the send's `from` (after default fallback) and `replyTo` must each match an entry (exact address or `*@domain` wildcard).",
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

export const listApiKeySenders = operations.list;
export const addApiKeySender = operations.add;
export const removeApiKeySender = operations.remove;
