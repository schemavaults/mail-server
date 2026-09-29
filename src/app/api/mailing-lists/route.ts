import "server-only";

import { serveOperations } from "@/lib/api/app";
import { createMailingList, listMailingLists } from "./operations";

export const { GET, POST } = serveOperations({
  GET: listMailingLists,
  POST: createMailingList,
});
