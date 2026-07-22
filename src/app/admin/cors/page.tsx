import "server-only";

import type { ReactElement } from "react";
import { CorsOriginsRegistry } from "@/lib/mail-db";
import type { CorsAllowedOrigin } from "@/lib/mail-db/cors-allowed-origins-table";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { connection } from "next/server";
import CorsOriginsClientView from "./cors-origins-client-view";

export default async function AdminCorsOriginsPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminCorsOriginsServerComponent({
      dbh,
    }): Promise<ReactElement> {
      let origins: readonly CorsAllowedOrigin[] = [];
      try {
        const registry = new CorsOriginsRegistry(dbh);
        origins = await registry.listOrigins();
      } catch (e: unknown) {
        console.error("Failed to preload allowed CORS origins for admin page: ", e);
      }

      return <CorsOriginsClientView initialOrigins={origins} />;
    },
  );
}
