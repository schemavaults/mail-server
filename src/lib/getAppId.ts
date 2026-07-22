import { SCHEMAVAULTS_MAIL_APP_ID } from "@/lib/schemavaults-apps";

export function getAppId() {
  return SCHEMAVAULTS_MAIL_APP_ID;
}

export default getAppId satisfies () => string;
