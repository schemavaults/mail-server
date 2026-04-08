import "server-only";

import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import type { ReactElement } from "react";
import { AdminLinksSection } from "@/components/AdminLinksSection";
import { connection } from "next/server";

async function AdminLandingPage(): Promise<ReactElement> {
  return <AdminLinksSection />;
}

export default async function AdminPage() {
  await connection();
  return await withAdminServerComponentRouteGuard(AdminLandingPage);
}
