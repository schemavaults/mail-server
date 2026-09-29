import "server-only";

import { serveOperations } from "@/lib/api/app";
import { listSubscribers } from "./operations";

export const { GET } = serveOperations({ GET: listSubscribers });
