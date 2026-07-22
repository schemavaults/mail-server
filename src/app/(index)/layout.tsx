import "server-only";

import type { ReactElement, ReactNode } from "react";
import PublicPageShell from "@/components/PublicPageShell";
import { isHomepageMailingListDirectoryEnabled } from "@/lib/branding";

/**
 * Homepage layout: shared public page chrome (nav + footer). The Nav title
 * matches whichever homepage variant the page renders — the mailing list
 * directory, or the minimal landing page when the directory is disabled via
 * HOMEPAGE_SHOW_MAILING_LISTS=false.
 */
export default function HomepageLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <PublicPageShell
      title={isHomepageMailingListDirectoryEnabled() ? "Mailing Lists" : "Mail"}
    >
      {children}
    </PublicPageShell>
  );
}
