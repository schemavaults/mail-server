import "server-only";

import { serveOperations } from "@/lib/api/app";
import { confirmSubscription } from "./operations";

export const { POST } = serveOperations({ POST: confirmSubscription });
