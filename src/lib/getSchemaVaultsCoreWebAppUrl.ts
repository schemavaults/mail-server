import {
  getAppEnvironment,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import {
  getClientWebAppDomain,
  SCHEMAVAULTS_WEB_APP_ID,
} from "@/lib/schemavaults-apps";

export function getSchemaVaultsCoreWebAppUrl(
  environment: SchemaVaultsAppEnvironment = getAppEnvironment(),
): string {
  return getClientWebAppDomain(SCHEMAVAULTS_WEB_APP_ID, environment);
}

export default getSchemaVaultsCoreWebAppUrl;
