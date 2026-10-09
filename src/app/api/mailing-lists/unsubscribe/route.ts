import "server-only";

import { serveOperations } from "@/lib/api/app";
import { unsubscribeFromMailingList } from "./operations";

export const { POST } = serveOperations({ POST: unsubscribeFromMailingList });
