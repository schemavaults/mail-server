import "server-only";

import { serveOperations } from "@/lib/api/app";
import { listEmailTemplates } from "./operations";

export const { GET } = serveOperations({ GET: listEmailTemplates });
