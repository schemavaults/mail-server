import { describe, expect, it } from "bun:test";
import { SCHEMAVAULTS_AUTH_EXTENSION } from "@schemavaults/openapi-operations";
import packageJson from "../../../../package.json";
import { buildMailServerOpenApiDocument } from "../document";
import {
  accessTokenBearerScheme,
  accessTokenCookieScheme,
  mailApiKeyScheme,
} from "../auth-schemes";

/** Every documented operation: path → methods that must be present. */
const EXPECTED_PATHS: Record<string, string[]> = {
  "/api/send": ["post"],
  "/api/mailing-lists": ["get", "post"],
  "/api/mailing-lists/join": ["post"],
  "/api/mailing-lists/confirm": ["post"],
  "/api/mailing-lists/unsubscribe": ["post"],
  "/api/mailing-lists/subscribers": ["get"],
  "/api/templates": ["get"],
  "/api/test-emails": ["get"],
  "/api/test-emails/{test_email_id}": ["get"],
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
  "/api/admin/transports/{transport_id}": ["patch"],
};

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

type OperationObject = Record<string, unknown> & {
  security?: Record<string, string[]>[];
  responses?: Record<string, unknown>;
};

describe("buildMailServerOpenApiDocument", () => {
  const doc = buildMailServerOpenApiDocument();
  const paths = (doc.paths ?? {}) as Record<
    string,
    Record<string, OperationObject>
  >;
  const operation = (path: string, method: string): OperationObject => {
    const found = paths[path]?.[method];
    if (!found) throw new Error(`missing ${method.toUpperCase()} ${path}`);
    return found;
  };

  it("generates an OpenAPI 3.1 document with info and servers", () => {
    expect(doc.openapi).toBe("3.1.0");
    expect(doc.info.title).toContain("Mail Server API");
    expect(doc.info.version).toBe(packageJson.version);
    expect(doc.servers?.length).toBeGreaterThan(0);
  });

  it("documents every API operation with the expected methods", () => {
    for (const [path, methods] of Object.entries(EXPECTED_PATHS)) {
      for (const method of methods) {
        expect(operation(path, method)).toBeDefined();
      }
    }
  });

  it("documents no unexpected paths or methods", () => {
    expect(Object.keys(paths).sort()).toEqual(
      Object.keys(EXPECTED_PATHS).sort(),
    );
    for (const [path, entry] of Object.entries(paths)) {
      const methods: string[] = HTTP_METHODS.filter(
        (method) => method in entry,
      );
      expect(methods.sort(), path).toEqual([...EXPECTED_PATHS[path]!].sort());
    }
  });

  it("gives every operation a unique operationId and a tag", () => {
    const ids: string[] = [];
    for (const entry of Object.values(paths)) {
      for (const method of HTTP_METHODS) {
        const op = entry[method];
        if (!op) continue;
        ids.push(op.operationId as string);
        expect((op.tags as string[]).length).toBeGreaterThan(0);
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("registers the access-token and API-key security schemes", () => {
    const schemes = doc.components?.securitySchemes ?? {};
    expect(schemes[accessTokenBearerScheme.name]).toMatchObject({
      type: "http",
      scheme: "bearer",
    });
    expect(schemes[accessTokenCookieScheme.name]).toMatchObject({
      type: "apiKey",
      in: "cookie",
    });
    expect(schemes[mailApiKeyScheme.name]).toMatchObject({
      type: "http",
      scheme: "bearer",
    });
  });

  it("describes admin-only, API-key, and public access", () => {
    const admin = operation("/api/admin/api-keys", "get");
    expect(admin[SCHEMAVAULTS_AUTH_EXTENSION]).toMatchObject({
      public: false,
      routeGuard: "admin",
      schemes: [accessTokenBearerScheme.name, accessTokenCookieScheme.name],
    });

    const send = operation("/api/send", "post");
    expect(send[SCHEMAVAULTS_AUTH_EXTENSION]).toMatchObject({
      public: false,
      schemes: [
        mailApiKeyScheme.name,
        accessTokenBearerScheme.name,
        accessTokenCookieScheme.name,
      ],
    });
    expect(send.security).toContainEqual({ [mailApiKeyScheme.name]: [] });

    const join = operation("/api/mailing-lists/join", "post");
    expect(join[SCHEMAVAULTS_AUTH_EXTENSION]).toMatchObject({ public: true });
    expect(join.security ?? []).toEqual([]);
  });

  it("documents the runtime's own error responses", () => {
    const responses = operation("/api/admin/api-keys", "post").responses ?? {};
    for (const status of ["400", "401", "403", "415", "500"]) {
      expect(responses[status], `missing ${status}`).toBeDefined();
    }
  });

  it("registers the shared envelope and domain component schemas", () => {
    const schemas = Object.keys(doc.components?.schemas ?? {});
    for (const expected of [
      "OperationError",
      "SuccessMessageResponse",
      "MailingList",
      "SendEmailRequestBody",
      "SendEmailTemplateMessage",
      "SendEmailRawMessage",
      "ApiKeyRecord",
      "CorsAllowedOrigin",
      "MailTransportKind",
      "BrandingAssetKind",
      "TestEmail",
      "TestEmailSummary",
      "TestEmailAttachment",
      "TestEmailAttachmentMetadata",
    ]) {
      expect(schemas, `missing component schema ${expected}`).toContain(
        expected,
      );
    }
  });
});
