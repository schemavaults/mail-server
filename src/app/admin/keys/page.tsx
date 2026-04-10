import "server-only";

import type { ReactElement } from "react";
import { MailKeysRegistry } from "@/lib/mail-db";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { connection } from "next/server";
import ApiKeysClientView from "./api-keys-client-view";

export default async function AdminApiKeysPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminApiKeysServerComponent({ dbh }): Promise<ReactElement> {
      let apiKeys: readonly ApiKeyRecord[] = [];
      try {
        const registry = new MailKeysRegistry(dbh);
        apiKeys = await registry.listApiKeys({ includeRevoked: false });
      } catch (e: unknown) {
        console.error("Failed to preload API keys for admin page: ", e);
      }

      return <ApiKeysClientView initialApiKeys={apiKeys} />;
    },
  );
}
