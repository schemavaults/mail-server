"use client";

import { Badge, cn, CopyButton, Separator } from "@schemavaults/ui";
import { FileJson, KeyRound } from "lucide-react";
import type { ReactElement } from "react";
import type { DocsViewModel } from "@/lib/openapi/view-model";
import { DocsSidebar } from "./DocsSidebar";
import { OperationCard } from "./OperationCard";

export interface ApiReferenceViewProps {
  doc: DocsViewModel;
}

/**
 * The dedicated, self-hosted API reference rendered at /docs — no external
 * CDN or embedded third-party viewer. The server builds a DocsViewModel from
 * the same OpenAPI document served at /api/openapi.json; this component and
 * its children (DocsSidebar, OperationCard, SchemaTree) render it with the
 * design system's own primitives.
 */
export function ApiReferenceView({
  doc,
}: ApiReferenceViewProps): ReactElement {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-screen-2xl grow items-start",
        "gap-8 px-4 py-6 md:px-8 md:py-8",
      )}
    >
      <DocsSidebar
        tagGroups={doc.tagGroups}
        className="hidden w-72 shrink-0 lg:flex"
      />

      <div className="flex min-w-0 grow flex-col gap-8">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold md:text-3xl">{doc.title}</h1>
            <Badge variant="secondary" className="font-mono">
              v{doc.version}
            </Badge>
            <Badge variant="outline" className="font-mono">
              OpenAPI 3.1
            </Badge>
          </div>
          {doc.description && (
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              {doc.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Base URL</span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                {doc.serverUrl}
              </code>
              <CopyButton
                value={doc.serverUrl}
                variant="ghost"
                size="icon-sm"
                aria-label="Copy base URL"
              />
            </span>
            <a
              href="/api/openapi.json"
              className="flex items-center gap-1.5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <FileJson className="size-4" aria-hidden />
              Raw OpenAPI document
            </a>
          </div>

          {doc.securitySchemes.length > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <KeyRound className="size-4 text-muted-foreground" aria-hidden />
                Authentication
              </h2>
              <ul className="flex flex-col gap-1.5">
                {doc.securitySchemes.map((scheme) => (
                  <li
                    key={scheme.name}
                    className="flex flex-wrap items-baseline gap-2 text-sm"
                  >
                    <Badge variant="outline" className="text-[11px]">
                      {scheme.label}
                    </Badge>
                    <span className="text-muted-foreground">
                      {scheme.description ??
                        "Bearer token in the Authorization header."}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        <Separator decorative orientation="horizontal" />

        {doc.tagGroups.map((group) => (
          <section
            key={group.name}
            aria-label={group.name}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">{group.name}</h2>
              {group.description && (
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              )}
            </div>
            {group.operations.map((operation) => (
              <OperationCard key={operation.slug} operation={operation} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export default ApiReferenceView;
