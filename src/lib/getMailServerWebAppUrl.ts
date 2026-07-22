import {
  getAppEnvironment,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";

const MAIL_SERVER_WEB_APP_URLS: Record<SchemaVaultsAppEnvironment, string> = {
  development: "http://localhost:5346",
  test: "http://schemavaults-mail",
  staging: "https://mail-staging.schemavaults.com",
  production: "https://mail.schemavaults.com",
};

export function getMailServerWebAppUrl(
  environment: SchemaVaultsAppEnvironment = getAppEnvironment(),
): string {
  return MAIL_SERVER_WEB_APP_URLS[environment];
}

export default getMailServerWebAppUrl;
