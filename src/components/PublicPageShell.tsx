"use client";

import { cn, Separator } from "@schemavaults/ui";
import type { PropsWithChildren, ReactElement, ReactNode } from "react";
import { Nav } from "@/components/Nav";
import PublicPageFooter from "@/components/PublicPageFooter";

export type PublicPageShellProps = PropsWithChildren<{
  /** Page title shown in the <Nav /> beside the brand wordmark. */
  title: ReactNode;
}>;

/**
 * Shared page chrome for the public-facing mailing list pages: the brand
 * <Nav /> on top, <PublicPageFooter /> on the bottom, and a growing <main>
 * for the page content in between. Route layouts (the homepage and
 * /admin/all_mailing_lists) wrap their pages in this shell so the individual
 * page views only render their main content.
 */
export function PublicPageShell({
  title,
  children,
}: PublicPageShellProps): ReactElement {
  return (
    <div
      className={cn(
        "w-full min-h-screen h-full",
        // justify-start, not justify-center: the growing <main> already
        // pushes the footer to the bottom on short pages, and centering a
        // column that overflows the viewport clips its top half above the
        // scrollable area (unreachable Nav/header on long pages like /docs).
        "flex flex-col justify-start items-stretch",
        "bg-background",
      )}
    >
      <Nav title={title} />
      <main className="flex flex-col justify-start items-stretch w-full grow flex-nowrap">
        {children}
      </main>
      <Separator decorative orientation="horizontal" className="w-full" />
      <PublicPageFooter containerClassName="w-full" />
    </div>
  );
}

export default PublicPageShell;
