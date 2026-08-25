import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Patches zod with the `.openapi()` annotation method exactly once. Every
// module that annotates a schema imports `z` from here instead of from "zod"
// directly, so the extension is guaranteed to have run before the schema is
// constructed regardless of module evaluation order.
//
// Deliberately NOT server-only: several annotated schemas (e.g. the API key
// name and sender-scope entry schemas) are shared with client components for
// input validation.
extendZodWithOpenApi(z);

export { z };

export default z;
