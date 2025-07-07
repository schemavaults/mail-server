import type { MailingListSubscriberTable } from "./mailing-list-subscriber-table";
import type { MailingListUnsubscribeTable } from "./mailing-list-unsubscribe-record-table";
import type { MailingListsTable } from "./mailing-lists-table";

export type MailDatabase = {
  mailing_lists: MailingListsTable;
  subscribers: MailingListSubscriberTable;
  unsubscribe_records: MailingListUnsubscribeTable;
};
