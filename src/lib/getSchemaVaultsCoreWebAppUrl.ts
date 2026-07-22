import {
  getAppEnvironment,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";

const SCHEMAVAULTS_CORE_WEB_APP_URLS: Record<
  SchemaVaultsAppEnvironment,
  string
> = {
  development: "http://localhost:3000",
  test: "http://schemavaults-web",
  staging: "https://staging.schemavaults.com",
  production: "https://schemavaults.com",
};

export function getSchemaVaultsCoreWebAppUrl(
  environment: SchemaVaultsAppEnvironment = getAppEnvironment(),
): string {
  return SCHEMAVAULTS_CORE_WEB_APP_URLS[environment];
}

export default getSchemaVaultsCoreWebAppUrl;
