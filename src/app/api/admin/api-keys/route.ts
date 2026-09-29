import "server-only";

import { serveOperations } from "@/lib/api/app";
import { createApiKey, listApiKeys } from "./operations";

export const { GET, POST } = serveOperations({
  GET: listApiKeys,
  POST: createApiKey,
});
