import type { SchemaVaultsAppEnvironment } from "@schemavaults/app-definitions";

// @schemavaults/app-definitions >= 0.11 no longer hardcodes the SchemaVaults
// ecosystem app/API-server definitions (they moved to the runtime app
// registry), so the identifiers and web app domains this app relies on are
// defined here instead.

export const SCHEMAVAULTS_MAIL_APP_ID = "schemavaults-mail";

export const SCHEMAVAULTS_MAIL_API_SERVER_ID = SCHEMAVAULTS_MAIL_APP_ID;

export const SCHEMAVAULTS_WEB_APP_ID = "schemavaults-web";

const CLIENT_WEB_APP_DOMAINS: Record<
  string,
  Record<SchemaVaultsAppEnvironment, string>
> = {
  [SCHEMAVAULTS_WEB_APP_ID]: {
    development: "http://localhost:3000",
    test: "http://schemavaults-web",
    staging: "https://staging.schemavaults.com",
    production: "https://schemavaults.com",
  },
  [SCHEMAVAULTS_MAIL_APP_ID]: {
    development: "http://localhost:5346",
    test: "http://schemavaults-mail",
    staging: "https://mail-staging.schemavaults.com",
    production: "https://mail.schemavaults.com",
  },
};

export function getClientWebAppDomain(
  web_app_id: string,
  environment: SchemaVaultsAppEnvironment,
): string {
  const domains = CLIENT_WEB_APP_DOMAINS[web_app_id];
  if (!domains) {
    throw new Error(
      `No domains defined for web app with ID "${web_app_id}"!`,
    );
  }
  const domain = domains[environment];
  if (!domain) {
    throw new Error(
      `No domain defined for web app with ID "${web_app_id}" in app environment "${environment}"!`,
    );
  }
  return domain;
}
