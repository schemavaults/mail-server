import "server-only";

import { handle } from "hono/vercel";
import { createApiKeyScopeRouteApp } from "../scope-route-factory";
import { transportMutationBodySchema } from "../scope-body-schemas";

const app = createApiKeyScopeRouteApp({
  segment: "transports",
  bodySchema: transportMutationBodySchema,
  entryFromBody: (body) => body.transport_id,
  expectedBodyShape: "{ transport_id }",
  parseLogNoun: "transport",
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

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
