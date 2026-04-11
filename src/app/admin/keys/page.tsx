import "server-only";

import type { ReactElement } from "react";
import { MailingListRegistry, MailKeysRegistry } from "@/lib/mail-db";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { connection } from "next/server";
import ApiKeysClientView from "./api-keys-client-view";

export default async function AdminApiKeysPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminApiKeysServerComponent({ dbh }): Promise<ReactElement> {
      let apiKeys: readonly ApiKeyRecord[] = [];
      let mailingLists: readonly MailingListDefinition[] = [];
      let allowlistsByKeyId: Record<string, string[]> = {};
      try {
        const keysRegistry = new MailKeysRegistry(dbh);
        const mailRegistry = new MailingListRegistry(dbh);
        const [keys, lists] = await Promise.all([
          keysRegistry.listApiKeys({ includeRevoked: false }),
          mailRegistry.listMailingLists("all"),
        ]);
        apiKeys = keys;
        mailingLists = lists;

        // Fetch each key's allowlist in parallel so the client view can
        // render "N audiences" labels and pre-check the manage dialog.
        const allowlistEntries = await Promise.all(
          keys.map(async (key) => {
            const ids = await keysRegistry.listAllowedMailingListIds(
              key.api_key_id,
            );
            return [key.api_key_id, ids] as const;
          }),
        );
        allowlistsByKeyId = Object.fromEntries(allowlistEntries);
      } catch (e: unknown) {
        console.error("Failed to preload API keys for admin page: ", e);
      }

      return (
        <ApiKeysClientView
          initialApiKeys={apiKeys}
          allMailingLists={mailingLists}
          initialAllowlistsByKeyId={allowlistsByKeyId}
        />
      );
    },
  );
}
