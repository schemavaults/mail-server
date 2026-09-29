import "server-only";

import { serveOpenApiDocument } from "@/lib/api/app";

// Not an operation itself: the document describes the catalogue, and is
// linked from the /docs header instead.
export const { GET } = serveOpenApiDocument("/api/openapi.json");
