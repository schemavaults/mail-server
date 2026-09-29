import "server-only";

import { serveOperations } from "@/lib/api/app";
import {
  addApiKeyRecipient,
  listApiKeyRecipients,
  removeApiKeyRecipient,
} from "./operations";

export const { GET, POST, DELETE } = serveOperations({
  GET: listApiKeyRecipients,
  POST: addApiKeyRecipient,
  DELETE: removeApiKeyRecipient,
});
