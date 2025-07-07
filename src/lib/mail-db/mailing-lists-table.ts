import type {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "@schemavaults/dbh";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";

export type MailingListsTable = MailingListDefinition;

export type MailingList = Selectable<MailingListsTable>;
export type NewMailingList = Insertable<MailingListsTable>;
export type MailingListUpdate = Updateable<MailingListsTable>;
