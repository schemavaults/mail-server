// Shared building blocks for the per-route Hono apps that back every
// Next.js route handler in this app (see createRouteApp for the pattern).
// NOTE: admin-guard and cors-middleware are server-only and deliberately not
// re-exported here so client code can import the response types.
export { createRouteApp } from "./create-route-app";
export {
  jsonError,
  badRequest,
  unauthorized,
  forbidden,
  notFoundError,
  internalServerError,
  jsonMessage,
  jsonData,
  jsonDataMessage,
  type ErrorResponseBody,
  type MessageResponseBody,
  type DataResponseBody,
  type DataMessageResponseBody,
} from "./responses";
export {
  parseJsonBody,
  type IParseJsonBodyOptions,
  type TParsedJsonBody,
  type ZodLikeSchema,
} from "./parse-json-body";
export { parseUuidParam, type TParsedParam } from "./parse-uuid-param";
