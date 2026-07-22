import type { ApiKeyMailingListAllowlistsTable } from "./api-key-mailing-list-allowlists-table";
import type { ApiKeysTable } from "./api-keys-table";
import type { BrandingAssetsTable } from "./branding-assets-table";
import type { CorsAllowedOriginsTable } from "./cors-allowed-origins-table";
import type { MailingListSubscriberTable } from "./mailing-list-subscriber-table";
import type { MailingListUnsubscribeTable } from "./mailing-list-unsubscribe-record-table";
import type { MailingListsTable } from "./mailing-lists-table";
import type { PendingSubscriptionsTable } from "./pending-subscriptions-table";

export type MailDatabase = {
  mailing_lists: MailingListsTable;
  subscribers: MailingListSubscriberTable;
  unsubscribe_records: MailingListUnsubscribeTable;
  api_keys: ApiKeysTable;
  api_key_mailing_list_allowlists: ApiKeyMailingListAllowlistsTable;
  pending_subscriptions: PendingSubscriptionsTable;
  cors_allowed_origins: CorsAllowedOriginsTable;
  branding_assets: BrandingAssetsTable;
};
