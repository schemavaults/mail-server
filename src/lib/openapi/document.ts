import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { getBrandConfig } from "@/lib/branding";
import { getMailServerBaseUrl } from "@/lib/mail-server-base-url";
import { registerSecuritySchemes } from "./security";
import { OPENAPI_TAG_DEFINITIONS } from "./tags";

// Per-route path registrations, colocated with each route's Hono app.
import { registerSendPaths } from "@/app/api/send/openapi";
import { registerMailingListsPaths } from "@/app/api/mailing-lists/openapi";
import { registerJoinMailingListPaths } from "@/app/api/mailing-lists/join/openapi";
import { registerUnsubscribeMailingListPaths } from "@/app/api/mailing-lists/unsubscribe/openapi";
import { registerConfirmSubscriptionPaths } from "@/app/api/mailing-lists/confirm/openapi";
import { registerSubscribersPaths } from "@/app/api/mailing-lists/subscribers/openapi";
import { registerTemplatesPaths } from "@/app/api/templates/openapi";
import { registerBrandingAssetPaths } from "@/app/api/branding/[asset_kind]/openapi";
import { registerApiKeysPaths } from "@/app/api/admin/api-keys/openapi";
import { registerApiKeyItemPaths } from "@/app/api/admin/api-keys/[api_key_id]/openapi";
import { registerApiKeyAllowlistPaths } from "@/app/api/admin/api-keys/[api_key_id]/allowlist/openapi";
import { registerApiKeyRecipientsPaths } from "@/app/api/admin/api-keys/[api_key_id]/recipients/openapi";
import { registerApiKeySendersPaths } from "@/app/api/admin/api-keys/[api_key_id]/senders/openapi";
import { registerApiKeyTransportsPaths } from "@/app/api/admin/api-keys/[api_key_id]/transports/openapi";
import { registerAdminBrandingPaths } from "@/app/api/admin/branding/[asset_kind]/openapi";
import { registerCorsOriginsPaths } from "@/app/api/admin/cors-origins/openapi";
import { registerAdminTemplatesPaths } from "@/app/api/admin/templates/openapi";
import { registerTemplatePreviewPaths } from "@/app/api/admin/templates/preview/openapi";
import { registerAdminTransportsPaths } from "@/app/api/admin/transports/openapi";
import { registerOpenApiDocumentPaths } from "@/app/api/openapi.json/openapi";

/**
 * Version of this API description (OpenAPI `info.version`), independent of
 * the package version. Bump on meaningful API-surface changes.
 */
export const OPENAPI_DOCUMENT_VERSION = "1.0.0";

const PATH_REGISTRARS: readonly ((registry: OpenAPIRegistry) => void)[] = [
  registerSendPaths,
  registerMailingListsPaths,
  registerJoinMailingListPaths,
  registerConfirmSubscriptionPaths,
  registerUnsubscribeMailingListPaths,
  registerSubscribersPaths,
  registerTemplatesPaths,
  registerBrandingAssetPaths,
  registerApiKeysPaths,
  registerApiKeyItemPaths,
  registerApiKeyAllowlistPaths,
  registerApiKeyRecipientsPaths,
  registerApiKeySendersPaths,
  registerApiKeyTransportsPaths,
  registerAdminBrandingPaths,
  registerCorsOriginsPaths,
  registerAdminTemplatesPaths,
  registerTemplatePreviewPaths,
  registerAdminTransportsPaths,
  registerOpenApiDocumentPaths,
];

export type OpenApiDocument = ReturnType<
  OpenApiGeneratorV31["generateDocument"]
>;

/**
 * Builds the OpenAPI 3.1 document for this mail server from the per-route
 * registrations above. Branding (title) and the server URL come from the
 * white-label environment configuration, so the document is deployment
 * specific; the route caches the result per process.
 */
export function buildOpenApiDocument(): OpenApiDocument {
  const registry = new OpenAPIRegistry();
  registerSecuritySchemes(registry);
  for (const register of PATH_REGISTRARS) {
    register(registry);
  }

  const brand = getBrandConfig();
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: `${brand.name} Mail Server API`,
      version: OPENAPI_DOCUMENT_VERSION,
      description:
        "API for managing mailing lists and sending transactional email. " +
        "Admin routes require an admin JWT bearer token; /api/send and /api/templates also accept a mail-server API key. " +
        "Interactive documentation lives at /docs.",
      contact: { email: brand.supportEmail },
    },
    servers: [{ url: getMailServerBaseUrl() }],
    tags: OPENAPI_TAG_DEFINITIONS,
  });
}

export default buildOpenApiDocument;
