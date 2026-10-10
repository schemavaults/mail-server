import "server-only";

import { serveOperations } from "@/lib/api/app";
import { listEmailSendLog } from "./operations";

export const { GET } = serveOperations({ GET: listEmailSendLog });
