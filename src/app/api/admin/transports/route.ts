import "server-only";

import { serveOperations } from "@/lib/api/app";
import { listTransports } from "./operations";

export const { GET } = serveOperations({ GET: listTransports });
