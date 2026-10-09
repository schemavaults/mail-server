import "server-only";

import { serveOperations } from "@/lib/api/app";
import { listTemplateIds } from "./operations";

export const { GET } = serveOperations({ GET: listTemplateIds });
