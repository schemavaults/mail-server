import "server-only";

import { defineApiKeyScopeOperations } from "../scope-operations";
import { transportMutationBodySchema } from "../scope-body-schemas";
import { mailTransportKindSchema } from "@/lib/mail-transport/transport-kind-schema";

const operations = defineApiKeyScopeOperations({
  segment: "transports",
  operationIds: {
    list: "listApiKeyTransports",
    add: "addApiKeyTransport",
    remove: "removeApiKeyTransport",
  },
  bodySchema: transportMutationBodySchema,
  entryFromBody: (body) => body.transport_id,
  entrySchema: mailTransportKindSchema,
  scopeName: "allowed-transports scope",
  entryName: "transport",
  description:
    "With zero entries the transport dimension is unrestricted; otherwise the send's resolved transport (explicit or deployment default) must be an entry.",
  list: (registry, apiKeyId) => registry.listAllowedTransportIds(apiKeyId),
  add: (registry, apiKeyId, entry) =>
    registry.addAllowedTransport(apiKeyId, entry),
  remove: (registry, apiKeyId, entry) =>
    registry.removeAllowedTransport(apiKeyId, entry),
  messages: {
    listError: "Failed to list API key allowed transports!",
    addSuccess: "Added transport to API key allowed transports.",
    addError: "Failed to add API key allowed transport!",
    addFkViolation: "Unknown api_key_id (foreign key violation).",
    removeSuccess: "Removed transport from API key allowed transports.",
    removeError: "Failed to remove API key allowed transport!",
  },
});

export const listApiKeyTransports = operations.list;
export const addApiKeyTransport = operations.add;
export const removeApiKeyTransport = operations.remove;
