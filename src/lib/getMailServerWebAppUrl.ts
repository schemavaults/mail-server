import {
  getAppEnvironment,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import {
  getClientWebAppDomain,
  SCHEMAVAULTS_MAIL_APP_ID,
} from "@/lib/schemavaults-apps";

export function getMailServerWebAppUrl(
  environment: SchemaVaultsAppEnvironment = getAppEnvironment(),
): string {
  return getClientWebAppDomain(SCHEMAVAULTS_MAIL_APP_ID, environment);
}

export default getMailServerWebAppUrl;
