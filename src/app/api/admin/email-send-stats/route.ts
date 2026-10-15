import "server-only";

import { serveOperations } from "@/lib/api/app";
import { getEmailSendStats } from "./operations";

export const { GET } = serveOperations({ GET: getEmailSendStats });
