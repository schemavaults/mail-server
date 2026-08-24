import "server-only";

import type { ReactElement } from "react";
import { MailingListRegistry, MailKeysRegistry } from "@/lib/mail-db";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import {
  loadMailTransportsAvailability,
  MAIL_TRANSPORT_KINDS,
} from "@/lib/mail-transport";
import { connection } from "next/server";
import ApiKeysClientView, {
  type ApiKeyScopesState,
  type TransportOption,
} from "./api-keys-client-view";

export default async function AdminApiKeysPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminApiKeysServerComponent({ dbh }): Promise<ReactElement> {
      let apiKeys: readonly ApiKeyRecord[] = [];
      let mailingLists: readonly MailingListDefinition[] = [];
      let scopesByKeyId: Record<string, ApiKeyScopesState> = {};
      let transportOptions: TransportOption[] = [];
      try {
        const keysRegistry = new MailKeysRegistry(dbh);
        const mailRegistry = new MailingListRegistry(dbh);
        const [keys, lists] = await Promise.all([
          keysRegistry.listApiKeys({ includeRevoked: false }),
          mailRegistry.listMailingLists("all"),
        ]);
        apiKeys = keys;
        mailingLists = lists;

        // Fetch each key's scopes in parallel so the client view can render
        // restriction labels and pre-populate the manage dialogs.
        const scopeEntries = await Promise.all(
          keys.map(async (key) => {
            const scopes = await keysRegistry.getApiKeyScopes(key.api_key_id);
            return [
              key.api_key_id,
              {
                mailingLists: scopes.allowedMailingListIds,
                recipients: scopes.allowedRecipientEmails,
                senders: scopes.allowedSenders,
                transports: scopes.allowedTransportIds,
              } satisfies ApiKeyScopesState,
            ] as const;
          }),
        );
        scopesByKeyId = Object.fromEntries(scopeEntries);
      } catch (e: unknown) {
        console.error("Failed to preload API keys for admin page: ", e);
      }

      try {
        const availability = loadMailTransportsAvailability();
        transportOptions = MAIL_TRANSPORT_KINDS.map((id) => ({
          id,
          configured: availability.configured.includes(id),
          is_default: availability.defaultTransport === id,
        }));
      } catch (e: unknown) {
        console.error("Failed to resolve mail transport availability: ", e);
      }

      return (
        <ApiKeysClientView
          initialApiKeys={apiKeys}
          allMailingLists={mailingLists}
          initialScopesByKeyId={scopesByKeyId}
          transportOptions={transportOptions}
        />
      );
    },
  );
}
