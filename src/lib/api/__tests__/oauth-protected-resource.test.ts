import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "bun:test";

const ENV_VARS = [
  "BRAND_NAME",
  "SCHEMAVAULTS_APP_ENVIRONMENT",
  "SCHEMAVAULTS_AUTH_SERVER_URL",
  "SCHEMAVAULTS_RESOURCE_URL",
] as const;
// Untyped view: SCHEMAVAULTS_APP_ENVIRONMENT is declared as a union.
const env: Record<string, string | undefined> = process.env;
const originalEnv = Object.fromEntries(
  ENV_VARS.map((name) => [name, env[name]]),
);

let GET: (request: Request) => Promise<Response>;

beforeAll(async () => {
  // The resource name is resolved when the route module loads.
  process.env.BRAND_NAME = "Acme";
  process.env.SCHEMAVAULTS_APP_ENVIRONMENT = "production";
  process.env.SCHEMAVAULTS_AUTH_SERVER_URL = "https://auth.acme.test";
  ({ GET } =
    await import("../../../app/.well-known/oauth-protected-resource/[[...path]]/route"));
});

afterEach(() => {
  delete process.env.SCHEMAVAULTS_RESOURCE_URL;
});

afterAll(() => {
  for (const name of ENV_VARS) {
    if (originalEnv[name] === undefined) delete env[name];
    else env[name] = originalEnv[name];
  }
});

function request(path: string): Request {
  return new Request(`https://mail.acme.test${path}`);
}

describe("GET /.well-known/oauth-protected-resource", () => {
  test("publishes the mail server's protected resource metadata", async () => {
    process.env.SCHEMAVAULTS_RESOURCE_URL = "https://mail.acme.test";
    const response = await GET(
      request("/.well-known/oauth-protected-resource"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(await response.json()).toEqual({
      resource: "https://mail.acme.test",
      authorization_servers: ["https://auth.acme.test"],
      bearer_methods_supported: ["header"],
      resource_name: "Acme Mail Server API",
      resource_documentation: "https://mail.acme.test/docs",
    });
  });

  test("answers 404 while SCHEMAVAULTS_RESOURCE_URL is unset", async () => {
    const response = await GET(
      request("/.well-known/oauth-protected-resource"),
    );
    expect(response.status).toBe(404);
  });
});
