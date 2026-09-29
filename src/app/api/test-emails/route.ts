import "server-only";

import { serveOperations } from "@/lib/api/app";
import { listTestEmails } from "./operations";

export const { GET } = serveOperations({ GET: listTestEmails });
