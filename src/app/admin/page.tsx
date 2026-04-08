import "server-only";

import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import type { ReactElement } from "react";
import { AdminLinksSection } from "@/components/AdminLinksSection";

async function AdminLandingPage(): Promise<ReactElement> {
  return <AdminLinksSection />;
}

export default async function AdminPage() {
  return await withAdminServerComponentRouteGuard(AdminLandingPage);
}
