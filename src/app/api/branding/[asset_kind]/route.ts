import "server-only";

import { serveOperations } from "@/lib/api/app";
import { getBrandingAsset } from "./operations";

export const { GET } = serveOperations({ GET: getBrandingAsset });
