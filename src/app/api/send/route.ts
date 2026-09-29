import "server-only";

import { serveOperations } from "@/lib/api/app";
import { sendEmail } from "./operations";

export const { POST } = serveOperations({ POST: sendEmail });
