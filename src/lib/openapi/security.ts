import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

// Security schemes shared by every documented route. Two bearer-token
// schemes exist: an admin JWT issued by the auth server, and a mail-server
// API key created at /admin/keys. Routes reference them via the
// `security` arrays below.

export const ADMIN_JWT_SECURITY_SCHEME = "AdminJwtAuth";
export const API_KEY_SECURITY_SCHEME = "MailApiKeyAuth";

export function registerSecuritySchemes(registry: OpenAPIRegistry): void {
  registry.registerComponent("securitySchemes", ADMIN_JWT_SECURITY_SCHEME, {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description:
      "Admin JWT access token issued by the auth server. The authenticated user must have the admin role.",
  });
  registry.registerComponent("securitySchemes", API_KEY_SECURITY_SCHEME, {
    type: "http",
    scheme: "bearer",
    description:
      "Mail-server API key (`svlts_mail_pk_...`) created by an admin at /admin/keys. Subject to the key's audience, sender, and transport scopes.",
  });
}

type SecurityRequirement = Record<string, string[]>;

/** Routes guarded by the admin JWT guard only. */
export const adminAuthSecurity: SecurityRequirement[] = [
  { [ADMIN_JWT_SECURITY_SCHEME]: [] },
];

/** Routes accepting either an admin JWT or a mail-server API key. */
export const adminOrApiKeySecurity: SecurityRequirement[] = [
  { [ADMIN_JWT_SECURITY_SCHEME]: [] },
  { [API_KEY_SECURITY_SCHEME]: [] },
];
