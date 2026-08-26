"use client";

import {
  Badge,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@schemavaults/ui";
import type { ReactElement } from "react";
import type { SchemaNodeVM } from "@/lib/openapi/view-model";

// Recursive renderer for the resolved schema trees produced by
// src/lib/openapi/view-model.ts. Top-level object properties render
// expanded; nested objects/arrays/unions sit behind a collapsible so large
// schemas (e.g. SendEmailRequestBody) stay scannable.

/** True when the node has structure worth an expandable child section. */
function hasChildren(node: SchemaNodeVM): boolean {
  if (node.circular) return false;
  return (
    (node.properties?.length ?? 0) > 0 ||
    (node.variants?.length ?? 0) > 0 ||
    (node.items !== undefined && hasChildren(node.items)) ||
    node.additionalProperties !== undefined
  );
}

function childrenSummary(node: SchemaNodeVM): string {
  if (node.variants?.length) return `${node.variants.length} options`;
  if (node.properties?.length)
    return `${node.properties.length} ${node.properties.length === 1 ? "property" : "properties"}`;
  if (node.items) return "array item";
  if (node.additionalProperties) return "value schema";
  return "details";
}

/** Inline chips: type label, ref name, required/nullable, constraints. */
function NodeSummaryLine({
  node,
  name,
}: {
  node: SchemaNodeVM;
  name?: string;
}): ReactElement {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      {name !== undefined && (
        <code className="font-mono text-sm font-medium">{name}</code>
      )}
      <span className="font-mono text-xs text-muted-foreground">
        {node.refName ?? node.typeLabel}
        {node.refName !== undefined && node.refName !== node.typeLabel && (
          <span className="text-muted-foreground/70"> · {node.typeLabel}</span>
        )}
        {node.nullable && <span> | null</span>}
      </span>
      {node.required && (
        <span className="text-xs font-medium text-destructive">required</span>
      )}
      {node.constraints?.map((constraint) => (
        <span
          key={constraint}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
        >
          {constraint}
        </span>
      ))}
      {node.circular && (
        <span className="text-xs italic text-muted-foreground">
          (recursive)
        </span>
      )}
    </span>
  );
}

/** Description, enum members, and example under the summary line. */
function NodeDetails({ node }: { node: SchemaNodeVM }): ReactElement | null {
  const hasEnums = (node.enumValues?.length ?? 0) > 0;
  if (!node.description && !hasEnums && node.example === undefined) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1">
      {node.description && (
        <p className="text-sm text-muted-foreground">{node.description}</p>
      )}
      {hasEnums && (
        <span className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {node.enumValues!.length === 1 ? "value:" : "one of:"}
          </span>
          {node.enumValues!.map((value) => (
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
      {node.example !== undefined && (
        <p className="text-xs text-muted-foreground">
          Example:{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">
            {node.example}
          </code>
        </p>
      )}
    </div>
  );
}

/** The expandable child structure of one node (if any). */
function NodeChildren({ node }: { node: SchemaNodeVM }): ReactElement | null {
  if (node.variants?.length) {
    return (
      <div className="flex flex-col gap-2">
        {node.variants.map((variant, index) => (
          <div
            key={index}
            className="flex flex-col gap-1 rounded-md border border-dashed p-2"
          >
            <span className="text-xs font-medium text-muted-foreground">
              Option {index + 1}
              {variant.refName !== undefined && ` — ${variant.refName}`}
            </span>
            <SchemaNodeBody node={variant} />
          </div>
        ))}
      </div>
    );
  }
  if (node.properties?.length) {
    return <PropertyList properties={node.properties} />;
  }
  if (node.additionalProperties) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          Arbitrary keys, each with:
        </span>
        <SchemaNodeBody node={node.additionalProperties} />
      </div>
    );
  }
  if (node.items && hasChildren(node.items)) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Each item:</span>
        <SchemaNodeBody node={node.items} />
      </div>
    );
  }
  return null;
}

/** Details + children for a node whose summary line is rendered elsewhere. */
function SchemaNodeBody({ node }: { node: SchemaNodeVM }): ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <NodeDetails node={node} />
      <NodeChildren node={node} />
    </div>
  );
}

function PropertyRow({
  name,
  node,
}: {
  name: string;
  node: SchemaNodeVM;
}): ReactElement {
  const expandable = hasChildren(node);
  if (!expandable) {
    return (
      <li className="flex flex-col gap-1 py-2">
        <NodeSummaryLine node={node} name={name} />
        <NodeDetails node={node} />
      </li>
    );
  }
  return (
    <li className="py-2">
      <Collapsible>
        <div className="flex flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <NodeSummaryLine node={node} name={name} />
            <CollapsibleTrigger
              className={cn(
                "w-auto gap-1 rounded px-1.5 py-0.5",
                "text-xs font-normal text-muted-foreground",
                "hover:bg-muted hover:text-foreground",
                "[&_svg]:size-3",
              )}
            >
              {childrenSummary(node)}
            </CollapsibleTrigger>
          </span>
          <NodeDetails node={node} />
        </div>
        <CollapsibleContent>
          <div className="mt-1.5 border-l-2 border-muted pl-3">
            <NodeChildren node={node} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

function PropertyList({
  properties,
}: {
  properties: NonNullable<SchemaNodeVM["properties"]>;
}): ReactElement {
  return (
    <ul className="flex flex-col divide-y divide-border/60">
      {properties.map(({ name, node }) => (
        <PropertyRow key={name} name={name} node={node} />
      ))}
    </ul>
  );
}

export interface SchemaTreeProps {
  node: SchemaNodeVM;
  className?: string;
}

/**
 * Renders one resolved schema tree. Root objects show their property list
 * directly; other root shapes (unions, arrays, primitives) show the summary
 * line first.
 */
export function SchemaTree({ node, className }: SchemaTreeProps): ReactElement {
  return (
    <div className={cn("flex flex-col gap-1.5 text-sm", className)}>
      {node.properties?.length ? (
        <>
          <NodeDetails node={node} />
          <PropertyList properties={node.properties} />
        </>
      ) : (
        <>
          <NodeSummaryLine node={node} />
          <SchemaNodeBody node={node} />
        </>
      )}
    </div>
  );
}

export default SchemaTree;
