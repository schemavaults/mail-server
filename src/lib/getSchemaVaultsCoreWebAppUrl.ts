import {
  getAppEnvironment,
  getHardcodedClientWebAppDomain,
  SCHEMAVAULTS_WEB,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";

export function getSchemaVaultsCoreWebAppUrl(
  environment: SchemaVaultsAppEnvironment = getAppEnvironment(),
): string {
  return getHardcodedClientWebAppDomain(SCHEMAVAULTS_WEB.app_id, environment);
}

export default getSchemaVaultsCoreWebAppUrl;
