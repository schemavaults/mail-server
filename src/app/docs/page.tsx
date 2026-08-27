import "server-only";

import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import PublicPageShell from "@/components/PublicPageShell";
import { ApiReferenceView } from "@/components/ApiDocs";
import { buildOpenApiDocument } from "@/lib/openapi/document";
import {
  buildDocsViewModel,
  type DocsViewModel,
} from "@/lib/openapi/view-model";
import { getBrandConfig } from "@/lib/branding";

// Branding and the server URL come from env at request time (matching
// /api/openapi.json), not from whatever env was present at build time.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const brand = getBrandConfig();
  return {
    title: `${brand.name} Mail Server API Reference`,
    robots: { index: false },
  };
}

// The view model only depends on env configuration, which is fixed for the
// lifetime of the process — build it once, lazily.
let cachedViewModel: DocsViewModel | null = null;

/**
 * Self-hosted interactive API reference for /api/openapi.json, rendered
 * entirely from this app's own components (src/components/ApiDocs) — no
 * external CDN. The OpenAPI document is built in-process rather than
 * fetched over HTTP.
 */
export default function ApiDocsPage(): ReactElement {
  cachedViewModel ??= buildDocsViewModel(buildOpenApiDocument());
  return (
    <PublicPageShell
      title="API Reference"
      navActions={
        // /docs is reachable from anywhere (including directly by URL), so
        // the way out is a plain link to the homepage rather than a
        // history-based "go back".
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
      }
    >
      <ApiReferenceView doc={cachedViewModel} />
    </PublicPageShell>
  );
}
