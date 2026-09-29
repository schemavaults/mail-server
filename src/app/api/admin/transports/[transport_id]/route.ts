import "server-only";

import { serveOperations } from "@/lib/api/app";
import { updateTransport } from "./operations";

export const { PATCH } = serveOperations({ PATCH: updateTransport });
