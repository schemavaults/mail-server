import "server-only";

import { serveOperations } from "@/lib/api/app";
import { getTestEmail } from "./operations";

export const { GET } = serveOperations({ GET: getTestEmail });
