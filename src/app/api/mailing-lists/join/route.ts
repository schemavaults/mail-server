import "server-only";

import { serveOperations } from "@/lib/api/app";
import { joinMailingList } from "./operations";

export const { POST, OPTIONS } = serveOperations(
  { POST: joinMailingList },
  { cors: true },
);
