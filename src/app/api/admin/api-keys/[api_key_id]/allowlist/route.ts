import "server-only";

import { serveOperations } from "@/lib/api/app";
import {
  addApiKeyAllowlistEntry,
  listApiKeyAllowlist,
  removeApiKeyAllowlistEntry,
} from "./operations";

export const { GET, POST, DELETE } = serveOperations({
  GET: listApiKeyAllowlist,
  POST: addApiKeyAllowlistEntry,
  DELETE: removeApiKeyAllowlistEntry,
});
