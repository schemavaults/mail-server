import { describe, expect, it } from "bun:test";
import packageJson from "../../../../package.json";
import { buildOpenApiDocument } from "../document";
import {
  ADMIN_JWT_SECURITY_SCHEME,
  API_KEY_SECURITY_SCHEME,
} from "../security";

/** Every documented route: path → methods that must be present. */
const EXPECTED_PATHS: Record<string, string[]> = {
  "/api/send": ["post"],
  "/api/mailing-lists": ["get", "post"],
  "/api/mailing-lists/join": ["post"],
  "/api/mailing-lists/confirm": ["post"],
  "/api/mailing-lists/unsubscribe": ["post"],
  "/api/mailing-lists/subscribers": ["get"],
  "/api/templates": ["get"],
  "/api/branding/{asset_kind}": ["get"],
  "/api/admin/api-keys": ["get", "post"],
  "/api/admin/api-keys/{api_key_id}": ["patch", "delete"],
  "/api/admin/api-keys/{api_key_id}/allowlist": ["get", "post", "delete"],
  "/api/admin/api-keys/{api_key_id}/recipients": ["get", "post", "delete"],
  "/api/admin/api-keys/{api_key_id}/senders": ["get", "post", "delete"],
  "/api/admin/api-keys/{api_key_id}/transports": ["get", "post", "delete"],
  "/api/admin/branding/{asset_kind}": ["put", "delete"],
  "/api/admin/cors-origins": ["get", "post"],
  "/api/admin/cors-origins/{cors_origin_id}": ["delete"],
  "/api/admin/templates": ["get"],
  "/api/admin/templates/preview": ["get", "post"],
  "/api/admin/transports": ["get"],
  "/api/openapi.json": ["get"],
};

describe("buildOpenApiDocument", () => {
  const doc = buildOpenApiDocument();

  it("generates an OpenAPI 3.1 document with info and servers", () => {
    expect(doc.openapi).toBe("3.1.0");
    expect(doc.info.title).toContain("Mail Server API");
    expect(doc.info.version).toBe(packageJson.version);
    expect(doc.servers?.length).toBeGreaterThan(0);
  });

  it("documents every API route with the expected methods", () => {
    const paths = doc.paths ?? {};
    for (const [path, methods] of Object.entries(EXPECTED_PATHS)) {
      const entry = paths[path] as Record<string, unknown> | undefined;
      expect(entry, `missing path ${path}`).toBeDefined();
      for (const method of methods) {
        expect(
          entry?.[method],
          `missing ${method.toUpperCase()} ${path}`,
        ).toBeDefined();
      }
    }
  });

  it("documents no unexpected paths", () => {
    const documented = Object.keys(doc.paths ?? {}).sort();
    expect(documented).toEqual(Object.keys(EXPECTED_PATHS).sort());
  });

  it("registers both bearer security schemes", () => {
    const schemes = doc.components?.securitySchemes ?? {};
    expect(schemes[ADMIN_JWT_SECURITY_SCHEME]).toMatchObject({
      type: "http",
      scheme: "bearer",
    });
    expect(schemes[API_KEY_SECURITY_SCHEME]).toMatchObject({
      type: "http",
      scheme: "bearer",
    });
  });

  it("registers the shared envelope and domain component schemas", () => {
    const schemas = Object.keys(doc.components?.schemas ?? {});
    for (const expected of [
      "ErrorResponse",
      "SuccessMessageResponse",
      "MailingList",
      "SendEmailRequestBody",
      "ApiKeyRecord",
      "CorsAllowedOrigin",
      "MailTransportKind",
      "BrandingAssetKind",
    ]) {
      expect(schemas, `missing component schema ${expected}`).toContain(
        expected,
      );
    }
  });
});
