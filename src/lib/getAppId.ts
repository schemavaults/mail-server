import { SCHEMAVAULTS_MAIL_APP_DEFINITION } from "@schemavaults/app-definitions";

export function getAppId() {
  return SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id;
}

export default getAppId satisfies () => string;
