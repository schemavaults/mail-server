// Shared building blocks for the per-route OpenAPI registrations. Each route
// folder keeps a colocated openapi.ts exporting a `register*Paths(registry)`
// function built from these helpers plus the route's own zod schemas; the
// document builder in ./document.ts aggregates them all.
export {
  errorResponseSchema,
  successMessageResponseSchema,
  successDataResponseSchema,
  successDataMessageResponseSchema,
} from "./schemas";
export {
  jsonResponse,
  jsonRequestBody,
  messageResponse,
  errorResponse,
  errorResponses,
} from "./route-helpers";
export {
  ADMIN_JWT_SECURITY_SCHEME,
  API_KEY_SECURITY_SCHEME,
  registerSecuritySchemes,
  adminAuthSecurity,
  adminOrApiKeySecurity,
} from "./security";
export { uuidPathParam, uuidQueryParam } from "./params";
export { OPENAPI_TAGS, OPENAPI_TAG_DEFINITIONS } from "./tags";
