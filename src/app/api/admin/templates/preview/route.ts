import "server-only";

import { serveOperations } from "@/lib/api/app";
import { previewTemplate, previewTemplateWithSampleProps } from "./operations";

export const { GET, POST } = serveOperations({
  GET: previewTemplateWithSampleProps,
  POST: previewTemplate,
});
