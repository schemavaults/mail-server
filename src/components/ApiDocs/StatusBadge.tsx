"use client";

import { cn } from "@schemavaults/ui";
import type { ReactElement } from "react";

// Follows the HttpMethodBadge precedent: theme tokens where the semantics
// line up, Tailwind color primitives (with dark variants) for the rest.
function statusClasses(status: string): string {
  const firstDigit = status.charAt(0);
  switch (firstDigit) {
    case "2":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "3":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
    case "4":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "5":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

/** Colored badge for an HTTP response status code. */
export function StatusBadge({
  status,
  className,
}: StatusBadgeProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex w-11 shrink-0 items-center justify-center rounded",
        "px-1.5 py-0.5 font-mono text-xs font-semibold",
        statusClasses(status),
        className,
      )}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
