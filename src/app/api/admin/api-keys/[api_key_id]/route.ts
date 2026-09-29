import "server-only";

import { serveOperations } from "@/lib/api/app";
import { revokeApiKey, updateApiKey } from "./operations";

export const { PATCH, DELETE } = serveOperations({
  PATCH: updateApiKey,
  DELETE: revokeApiKey,
});
