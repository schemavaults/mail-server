import { describe, expect, it, mock } from "bun:test";
import { OperationError } from "@schemavaults/openapi-operations";

// Exercises the route handlers the operations runtime serves, end to end
// through `serveOperations()`: credential resolution, the admin-only rule for
// access tokens, API keys, request validation and CORS. Credential
// verification and the CORS allowlist are stubbed so no database or auth
// server is needed; the operations exercised never reach the database.

const VALID_API_KEY = "svlts_mail_pk_valid-test-key";
const VALID_API_KEY_ID = "0f4b4a52-8b1f-4f8e-9b7a-3f4d1e2c5a6b";
const ADMIN_TOKEN = "admin-access-token";
const USER_TOKEN = "non-admin-access-token";
const ALLOWED_ORIGIN = "https://allowed.example";

function bearerToken(req: Pick<Request, "headers">): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
}

mock.module("@/lib/api-keys/validateApiKeyFromRequest", () => ({
  requestLooksLikeApiKeyAuth: (req: Request) =>
    bearerToken(req)?.startsWith("svlts_mail_pk_") ?? false,
  validateApiKeyFromRequest: async (req: Request) =>
    bearerToken(req) === VALID_API_KEY
      ? { valid: true, record: { api_key_id: VALID_API_KEY_ID } }
      : { valid: false },
}));

mock.module("@schemavaults/auth-server-sdk/openapi-operations", () => ({
  createSchemaVaultsAuthResolvers: () => ({
    "schemavaults-access-token": async (
      c: { req: { raw: Request } },
      scheme: { name: string },
    ) => {
      const token = bearerToken(c.req.raw);
      if (token === null) return null;
      if (token !== ADMIN_TOKEN && token !== USER_TOKEN) {
        throw new OperationError(401, {
          error: "invalid_token",
          message: "The access token is invalid or has expired",
        });
      }
      const admin = token === ADMIN_TOKEN;
      return {
        scheme: scheme.name,
        user: { uid: "8d7f6e5c-4b3a-4291-8f7e-6d5c4b3a2910", admin },
        isAdmin: admin,
        scope: null,
      };
    },
    "schemavaults-access-token-cookie": async () => null,
  }),
}));

mock.module("@/lib/cors", () => ({
  corsPreflightResponse: async (req: Request) => {
    const headers = new Headers();
    if (req.headers.get("origin") === ALLOWED_ORIGIN) {
      headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    }
    return new Response(null, { status: 204, headers });
  },
  applyCorsHeaders: async (req: Request, res: Response) => {
    if (req.headers.get("origin") === ALLOWED_ORIGIN) {
      res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    }
    return res;
  },
}));

const adminTemplates = await import("@/app/api/admin/templates/route");
const templates = await import("@/app/api/templates/route");
const unsubscribe = await import("@/app/api/mailing-lists/unsubscribe/route");
const join = await import("@/app/api/mailing-lists/join/route");
const allowlist = await import(
  "@/app/api/admin/api-keys/[api_key_id]/allowlist/route"
);
const openApiJson = await import("@/app/api/openapi.json/route");
const adminBranding = await import(
  "@/app/api/admin/branding/[asset_kind]/route"
);
const { serveOperations } = await import("../app");
const { sendEmail } = await import("@/app/api/send/operations");

function request(
  path: string,
  init: RequestInit & { token?: string } = {},
): Request {
  const headers = new Headers(init.headers);
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);
  return new Request(`http://localhost${path}`, { ...init, headers });
}

async function json(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>;
}

describe("admin-only operations", () => {
  it("answer 401 with a challenge when no credential is presented", async () => {
    const res = await adminTemplates.GET(request("/api/admin/templates"));
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toContain("Bearer");
    expect(await json(res)).toMatchObject({
      success: false,
      error: "unauthorized",
    });
  });

  it("serve an admin's access token", async () => {
    const res = await adminTemplates.GET(
      request("/api/admin/templates", { token: ADMIN_TOKEN }),
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.success).toBe(true);
    expect(body.data).toContain("mailing-list-confirmation");
  });

  it("refuse a non-admin user's access token", async () => {
    const res = await adminTemplates.GET(
      request("/api/admin/templates", { token: USER_TOKEN }),
    );
    expect(res.status).toBe(403);
    expect(await json(res)).toMatchObject({ error: "forbidden" });
  });

  it("do not accept an API key", async () => {
    const res = await adminTemplates.GET(
      request("/api/admin/templates", { token: VALID_API_KEY }),
    );
    expect(res.status).toBe(401);
  });

  it("validate path parameters before the handler runs", async () => {
    const res = await allowlist.GET(
      request("/api/admin/api-keys/not-a-uuid/allowlist", {
        token: ADMIN_TOKEN,
      }),
    );
    expect(res.status).toBe(400);
    const body = await json(res);
    expect(body.error).toBe("validation_error");
    expect(body.issues).toContainEqual(
      expect.objectContaining({
        location: "params",
        message: "Invalid api_key_id; must be a valid UUID.",
      }),
    );
  });
});

describe("multipart uploads", () => {
  async function upload(form: FormData, assetKind = "logo") {
    return await adminBranding.PUT(
      request(`/api/admin/branding/${assetKind}`, {
        method: "PUT",
        token: ADMIN_TOKEN,
        body: form,
      }),
    );
  }

  it("reach the handler with the body unread", async () => {
    const form = new FormData();
    form.set("not-file", "x");
    const res = await upload(form);
    expect(res.status).toBe(400);
    expect(await json(res)).toMatchObject({
      message: "Expected multipart form data with a 'file' field.",
    });
  });

  it("keep the handler's own file checks", async () => {
    const form = new FormData();
    form.set("file", new File(["hello"], "logo.txt", { type: "text/plain" }));
    const res = await upload(form);
    expect(res.status).toBe(400);
    expect((await json(res)).message).toStartWith("Unsupported image type");
  });

  it("reject an unknown asset kind", async () => {
    const res = await upload(new FormData(), "banner");
    expect(res.status).toBe(400);
    expect(await json(res)).toMatchObject({ error: "validation_error" });
  });
});

describe("API-key-or-admin operations", () => {
  it("serve a valid API key", async () => {
    const res = await templates.GET(
      request("/api/templates", { token: VALID_API_KEY }),
    );
    expect(res.status).toBe(200);
    expect(await json(res)).toMatchObject({ success: true });
  });

  it("refuse an unknown or revoked API key", async () => {
    const res = await templates.GET(
      request("/api/templates", { token: "svlts_mail_pk_unknown" }),
    );
    expect(res.status).toBe(401);
    expect(await json(res)).toMatchObject({
      error: "invalid_api_key",
      message: "Invalid or revoked API key.",
    });
  });

  it("serve an admin's access token", async () => {
    const res = await templates.GET(
      request("/api/templates", { token: ADMIN_TOKEN }),
    );
    expect(res.status).toBe(200);
  });

  it("refuse a non-admin user's access token", async () => {
    const res = await templates.GET(
      request("/api/templates", { token: USER_TOKEN }),
    );
    expect(res.status).toBe(403);
  });
});

describe("public operations", () => {
  it("accept unlabelled JSON bodies and validate them", async () => {
    // What `fetch(url, { body: JSON.stringify(...) })` sends without an
    // explicit Content-Type header.
    const res = await unsubscribe.POST(
      request("/api/mailing-lists/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ email: "not-an-email" }),
      }),
    );
    expect(res.status).toBe(400);
    expect(await json(res)).toMatchObject({
      success: false,
      error: "validation_error",
    });
  });

  it("answer CORS preflights for cross-origin routes", async () => {
    const res = await join.OPTIONS(
      request("/api/mailing-lists/join", {
        method: "OPTIONS",
        headers: { Origin: ALLOWED_ORIGIN },
      }),
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      ALLOWED_ORIGIN,
    );
  });

  it("add CORS headers to cross-origin responses", async () => {
    const res = await join.POST(
      request("/api/mailing-lists/join", {
        method: "POST",
        headers: { Origin: ALLOWED_ORIGIN, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(400);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      ALLOWED_ORIGIN,
    );
  });
});

describe("serveOperations", () => {
  it("serves the OpenAPI document", async () => {
    const res = await openApiJson.GET(request("/api/openapi.json"));
    expect(res.status).toBe(200);
    expect(await json(res)).toMatchObject({ openapi: "3.1.0" });
  });

  it("refuses an operation exported under the wrong method", () => {
    expect(() => serveOperations({ GET: sendEmail })).toThrow(TypeError);
  });
});
