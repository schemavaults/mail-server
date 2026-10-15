import "server-only";

import { serveOperations } from "@/lib/api/app";
import { getDeploymentSettings, updateDeploymentSettings } from "./operations";

export const { GET, PATCH } = serveOperations({
  GET: getDeploymentSettings,
  PATCH: updateDeploymentSettings,
});
