import {
  getAppEnvironment,
  getHardcodedClientWebAppDomain,
  SCHEMAVAULTS_MAIL_APP_DEFINITION,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";

export function getMailServerWebAppUrl(
  environment: SchemaVaultsAppEnvironment = getAppEnvironment(),
): string {
  return getHardcodedClientWebAppDomain(
    SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id,
    environment,
  );
}

export default getMailServerWebAppUrl;
