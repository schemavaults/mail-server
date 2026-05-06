import "server-only";

import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import type { ReactElement } from "react";
import { AdminLinksSection } from "@/components/AdminLinksSection";
import { Nav } from "@/components/Nav";
import { connection } from "next/server";
import { cn } from "@schemavaults/ui";

async function AdminLandingPage(): Promise<ReactElement> {
  return (
    <div
      className={cn(
        "w-full min-h-screen h-full",
        "flex flex-col justify-start items-stretch",
        "bg-background",
      )}
    >
      <Nav title="Admin" />
      <main className="flex flex-col justify-start items-stretch w-full grow flex-nowrap">
        <AdminLinksSection renderLocation="admin_dashboard" />
      </main>
    </div>
  );
}

export default async function AdminPage() {
  await connection();
  return await withAdminServerComponentRouteGuard(AdminLandingPage);
}
