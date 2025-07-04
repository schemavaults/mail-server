import {
  getAppEnvironment,
  getHardcodedClientWebAppDomain,
  SCHEMAVAULTS_WEB,
} from "@schemavaults/app-definitions";
import { redirect } from "next/navigation";
import "server-only";

export async function IndexPage() {
  return redirect(
    getHardcodedClientWebAppDomain(
      SCHEMAVAULTS_WEB.app_id,
      getAppEnvironment(),
    ),
  );
}
