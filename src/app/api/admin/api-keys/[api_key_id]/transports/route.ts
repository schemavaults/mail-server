import "server-only";

import { serveOperations } from "@/lib/api/app";
import {
  addApiKeyTransport,
  listApiKeyTransports,
  removeApiKeyTransport,
} from "./operations";

export const { GET, POST, DELETE } = serveOperations({
  GET: listApiKeyTransports,
  POST: addApiKeyTransport,
  DELETE: removeApiKeyTransport,
});
