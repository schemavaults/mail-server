import "server-only";

import { serveOperations } from "@/lib/api/app";
import { removeCorsOrigin } from "./operations";

export const { DELETE } = serveOperations({ DELETE: removeCorsOrigin });
