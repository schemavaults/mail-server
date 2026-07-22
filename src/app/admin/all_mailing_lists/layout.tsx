import "server-only";

import type { ReactElement, ReactNode } from "react";
import PublicPageShell from "@/components/PublicPageShell";

export default function AllMailingListsLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <PublicPageShell title="Mailing Lists">{children}</PublicPageShell>;
}
