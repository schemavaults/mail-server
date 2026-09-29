import "server-only";

import { serveOperations } from "@/lib/api/app";
import { removeBrandingAsset, uploadBrandingAsset } from "./operations";

export const { PUT, DELETE } = serveOperations({
  PUT: uploadBrandingAsset,
  DELETE: removeBrandingAsset,
});
