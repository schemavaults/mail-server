"use client";

import { cn, HttpMethodBadge, type HttpMethod } from "@schemavaults/ui";
import { useEffect, useState, type ReactElement } from "react";
import type { TagGroupVM } from "@/lib/openapi/view-model";

export interface DocsSidebarProps {
  tagGroups: TagGroupVM[];
  className?: string;
}

/**
 * Sticky in-page navigation for the API reference: one link per operation,
 * grouped by tag, with the operation currently in view highlighted via an
 * IntersectionObserver scrollspy.
 */
export function DocsSidebar({
  tagGroups,
  className,
}: DocsSidebarProps): ReactElement {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    const slugs = tagGroups.flatMap((group) =>
      group.operations.map((operation) => operation.slug),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        // Highlight the first operation card intersecting the upper half of
        // the viewport; entries arrive unordered, so pick the topmost.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        const first = visible[0];
        if (first) setActiveSlug(first.target.id);
      },
      { rootMargin: "0px 0px -50% 0px" },
    );
    for (const slug of slugs) {
      const element = document.getElementById(slug);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [tagGroups]);

  return (
    <nav
      aria-label="API operations"
      className={cn(
        "sticky top-4 max-h-[calc(100dvh-2rem)] overflow-y-auto",
        "flex flex-col gap-4 pr-2 text-sm",
        className,
      )}
    >
      {tagGroups.map((group) => (
        <div key={group.name} className="flex flex-col gap-1">
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.name}
          </span>
          <ul className="flex flex-col">
            {group.operations.map((operation) => (
              <li key={operation.slug}>
                <a
                  href={`#${operation.slug}`}
                  aria-current={
                    activeSlug === operation.slug ? "location" : undefined
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5",
                    "hover:bg-muted",
                    activeSlug === operation.slug
                      ? "bg-muted font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  <HttpMethodBadge
                    method={operation.method as HttpMethod}
                    appearance="soft"
                    size="sm"
                    width="fixed"
                  />
                  <span className="truncate">
                    {operation.summary ?? operation.path}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default DocsSidebar;
