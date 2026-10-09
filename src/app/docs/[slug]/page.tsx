import type { Metadata } from "next";
import {
  apiDocs,
  withNoIndex,
  type ApiDocsOperationPageProps,
} from "../api-docs";

// Rendered per request like the index (see ../page.tsx); unknown slugs 404.
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: ApiDocsOperationPageProps,
): Promise<Metadata> {
  return withNoIndex(await apiDocs.generateOperationMetadata(props));
}

export default apiDocs.OperationPage;
