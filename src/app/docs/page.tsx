import type { Metadata } from "next";
import { apiDocs, withNoIndex } from "./api-docs";

// Branding and the server URL come from env at request time (matching
// /api/openapi.json), not from whatever env was present at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return withNoIndex(await apiDocs.generateIndexMetadata());
}

export default apiDocs.IndexPage;
