// The app's single zod entrypoint: `z` from @schemavaults/openapi-operations,
// which patches zod with the `.openapi()` annotation method (via
// @asteasolutions/zod-to-openapi) exactly once, before any schema that
// annotates itself is constructed. Every module that annotates a schema
// imports `z` from here instead of from "zod" directly.
//
// Imported from the package's zod-only module rather than its root entry:
// several annotated schemas (e.g. the API key name and sender-scope entry
// schemas) are shared with client components for input validation, and the
// root entry would drag the Hono operations runtime into client bundles.
export { z, withOpenApi } from "@schemavaults/openapi-operations/zod-openapi.js";

export { z as default } from "@schemavaults/openapi-operations/zod-openapi.js";
