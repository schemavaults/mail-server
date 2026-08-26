"use client";

import {
  Badge,
  cn,
  CodeBlock,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CopyButton,
  HttpMethodBadge,
  type HttpMethod,
} from "@schemavaults/ui";
import { Link as LinkIcon, Lock } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import type { OperationVM } from "@/lib/openapi/view-model";
import { SchemaTree } from "./SchemaTree";
import { StatusBadge } from "./StatusBadge";

function SectionLabel({ children }: { children: ReactNode }): ReactElement {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h4>
  );
}

function ParametersSection({
  operation,
}: {
  operation: OperationVM;
}): ReactElement | null {
  if (operation.parameters.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>Parameters</SectionLabel>
      <ul className="flex flex-col divide-y divide-border/60 rounded-md border px-3">
        {operation.parameters.map((parameter) => (
          <li
            key={`${parameter.location}-${parameter.name}`}
            className="flex flex-col gap-1 py-2"
          >
            <span className="flex flex-wrap items-baseline gap-2">
              <code className="font-mono text-sm font-medium">
                {parameter.name}
              </code>
              <Badge variant="outline" className="text-[11px]">
                {parameter.location}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {parameter.node.refName ?? parameter.node.typeLabel}
              </span>
              {parameter.required && (
                <span className="text-xs font-medium text-destructive">
                  required
                </span>
              )}
            </span>
            {parameter.node.description && (
              <p className="text-sm text-muted-foreground">
                {parameter.node.description}
              </p>
            )}
            {(parameter.node.enumValues?.length ?? 0) > 0 && (
              <span className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-muted-foreground">one of:</span>
                {parameter.node.enumValues!.map((value) => (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="font-mono text-[11px]"
                  >
                    {value}
                  </Badge>
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RequestBodySection({
  operation,
}: {
  operation: OperationVM;
}): ReactElement | null {
  if (operation.requestBody.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>
        Request body
        {!operation.requestBodyRequired && (
          <span className="ml-1 font-normal normal-case">(optional)</span>
        )}
      </SectionLabel>
      {operation.requestBody.map((media) => (
        <div
          key={media.contentType}
          className="flex flex-col gap-2 rounded-md border p-3"
        >
          <code className="font-mono text-xs text-muted-foreground">
            {media.contentType}
          </code>
          {media.schema && <SchemaTree node={media.schema} />}
        </div>
      ))}
    </div>
  );
}

function ResponsesSection({
  operation,
}: {
  operation: OperationVM;
}): ReactElement | null {
  if (operation.responses.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>Responses</SectionLabel>
      <ul className="flex flex-col divide-y divide-border/60 rounded-md border px-3">
        {operation.responses.map((response) => {
          const schemaMedia = response.media.filter(
            (media) => media.schema !== null,
          );
          return (
            <li key={response.status} className="flex flex-col gap-1 py-2">
              <span className="flex flex-wrap items-center gap-2">
                <StatusBadge status={response.status} />
                <span className="text-sm">{response.description}</span>
              </span>
              {schemaMedia.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger
                    className={cn(
                      "w-auto gap-1 rounded px-1.5 py-0.5",
                      "text-xs font-normal text-muted-foreground",
                      "hover:bg-muted hover:text-foreground",
                      "[&_svg]:size-3",
                    )}
                  >
                    Response schema
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1.5 flex flex-col gap-2 border-l-2 border-muted pl-3">
                      {schemaMedia.map((media) => (
                        <div
                          key={media.contentType}
                          className="flex flex-col gap-1"
                        >
                          <code className="font-mono text-xs text-muted-foreground">
                            {media.contentType}
                          </code>
                          <SchemaTree node={media.schema!} />
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export interface OperationCardProps {
  operation: OperationVM;
}

/** Full reference card for one documented operation. */
export function OperationCard({
  operation,
}: OperationCardProps): ReactElement {
  return (
    <article
      id={operation.slug}
      className="flex scroll-mt-6 flex-col gap-4 rounded-lg border bg-card p-4 md:p-5"
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <HttpMethodBadge
            method={operation.method as HttpMethod}
            appearance="soft"
            width="fixed"
          />
          <code className="break-all font-mono text-sm font-medium md:text-base">
            {operation.path}
          </code>
          <CopyButton
            value={operation.path}
            variant="ghost"
            size="icon-sm"
            aria-label="Copy path"
          />
          <a
            href={`#${operation.slug}`}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Link to ${operation.method} ${operation.path}`}
          >
            <LinkIcon className="size-3.5" aria-hidden />
          </a>
        </div>
        {operation.summary && (
          <h3 className="text-base font-semibold md:text-lg">
            {operation.summary}
          </h3>
        )}
        {operation.description && (
          <p className="text-sm text-muted-foreground">
            {operation.description}
          </p>
        )}
        {operation.securityLabels.length > 0 && (
          <span className="flex flex-wrap items-center gap-1.5">
            <Lock className="size-3.5 text-muted-foreground" aria-hidden />
            {operation.securityLabels.map((label) => (
              <Badge key={label} variant="outline" className="text-[11px]">
                {label}
              </Badge>
            ))}
            {operation.securityLabels.length > 1 && (
              <span className="text-xs text-muted-foreground">
                (either accepted)
              </span>
            )}
          </span>
        )}
      </header>

      <ParametersSection operation={operation} />
      <RequestBodySection operation={operation} />

      <div className="flex flex-col gap-2">
        <SectionLabel>Example request</SectionLabel>
        <CodeBlock
          value={operation.curlExample}
          language="bash"
          size="sm"
          wrap
        />
      </div>

      <ResponsesSection operation={operation} />
    </article>
  );
}

export default OperationCard;
