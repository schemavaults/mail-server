import "server-only";

import { serveOperations } from "@/lib/api/app";
import {
  addApiKeySender,
  listApiKeySenders,
  removeApiKeySender,
} from "./operations";

export const { GET, POST, DELETE } = serveOperations({
  GET: listApiKeySenders,
  POST: addApiKeySender,
  DELETE: removeApiKeySender,
});
