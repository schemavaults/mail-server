import "server-only";

import {
  buildOpenApiDocument,
  type OpenAPIObject,
} from "@schemavaults/openapi-operations";
import packageJson from "../../../package.json";
import { getBrandConfig } from "@/lib/branding";
import { getMailServerBaseUrl } from "@/lib/mail-server-base-url";
import { MAIL_SERVER_OPERATIONS } from "./operations";
import { OPENAPI_TAG_DEFINITIONS } from "./tags";

/**
 * Version of this API description (OpenAPI `info.version`), resolved from
 * the package.json version so the document tracks releases automatically.
 * The JSON import is inlined at build time — no runtime filesystem read.
 */
export const OPENAPI_DOCUMENT_VERSION: string = packageJson.version;

/**
 * Builds the OpenAPI 3.1 document for this mail server from the operations
 * catalogue. Branding (title) and the server URL come from the white-label
 * environment configuration, so the document is deployment specific.
 * Responses the operations runtime produces on its own (validation,
 * authentication, unexpected failures) are documented on every operation
 * that can produce them.
 */
export function buildMailServerOpenApiDocument(): OpenAPIObject {
  const brand = getBrandConfig();
  return buildOpenApiDocument({
    info: {
      title: `${brand.name} Mail Server API`,
      version: OPENAPI_DOCUMENT_VERSION,
      description:
        "API for managing mailing lists and sending transactional email. " +
        "Admin operations require an admin's access token; /api/send, /api/templates and /api/test-emails also accept a mail-server API key. " +
        "Interactive documentation lives at /docs.",
      contact: { email: brand.supportEmail },
    },
    servers: [{ url: getMailServerBaseUrl() }],
    tags: OPENAPI_TAG_DEFINITIONS,
    operations: MAIL_SERVER_OPERATIONS,
    documentRuntimeResponses: true,
  });
}

// The document only depends on env configuration (branding, HOST), which is
// fixed for the lifetime of the process — build it once, lazily.
let cachedDocument: OpenAPIObject | null = null;

/** The process-wide OpenAPI document, served at /api/openapi.json and /docs. */
export function getMailServerOpenApiDocument(): OpenAPIObject {
  cachedDocument ??= buildMailServerOpenApiDocument();
  return cachedDocument;
}
