import "server-only";

import { createOAuthProtectedResourceMetadataRoute } from "@schemavaults/auth-server-sdk/oauth-protected-resource";
import { getBrandConfig } from "@/lib/branding";

// GET /.well-known/oauth-protected-resource — RFC 9728 protected resource
// metadata: tells OAuth clients (MCP clients, for one) which authorization
// server issues tokens for this mail server and which `resource` URL to
// request them for. The optional catch-all also answers the path-suffixed
// URLs of RFC 9728 §3.1. Not an operation, so it lives outside /api and the
// OpenAPI catalogue.
//
// The resource is SCHEMAVAULTS_RESOURCE_URL (answers 404 while it is unset),
// which the access-token resolvers also accept as a token audience; the
// authorization server is SCHEMAVAULTS_AUTH_SERVER_URL.
export const { GET, OPTIONS } = createOAuthProtectedResourceMetadataRoute({
  resource_name: `${getBrandConfig().name} Mail Server API`,
  resource_documentation: "/docs",
});

export const dynamic = "force-dynamic";
