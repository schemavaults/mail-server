import "server-only";

import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";
import {
  createApiDocsPages,
  type ApiDocsOperationPageProps,
} from "@schemavaults/openapi-docs-ui/nextjs";
import PublicPageShell from "@/components/PublicPageShell";
import { getMailServerOpenApiDocument } from "@/lib/api/document";

export type { ApiDocsOperationPageProps };

const DOCS_BASE_PATH = "/docs";

/**
 * The self-hosted API reference: an index of every operation (/docs) and
 * one page per operation (/docs/[slug]), rendered by
 * @schemavaults/openapi-docs-ui from the OpenAPI document built in-process
 * from the operations catalogue — no external CDN, nothing fetched over
 * HTTP.
 */
export const apiDocs = createApiDocsPages({
  loadDocument: () => getMailServerOpenApiDocument(),
  basePath: DOCS_BASE_PATH,
  openApiDocumentHref: "/api/openapi.json",
  wrap: (page) => <ApiDocsPageShell>{page}</ApiDocsPageShell>,
});

function ApiDocsPageShell({ children }: { children: ReactElement }) {
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
      <div className="mx-auto flex w-full max-w-screen-xl grow flex-col px-4 py-6 md:px-8 md:py-8">
        {children}
      </div>
    </PublicPageShell>
  );
}

/** The API reference is for integrators, not search engines. */
export function withNoIndex(metadata: Metadata): Metadata {
  return { ...metadata, robots: { index: false } };
}
