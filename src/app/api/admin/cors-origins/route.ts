import "server-only";

import { serveOperations } from "@/lib/api/app";
import { addCorsOrigin, listCorsOrigins } from "./operations";

export const { GET, POST } = serveOperations({
  GET: listCorsOrigins,
  POST: addCorsOrigin,
});
