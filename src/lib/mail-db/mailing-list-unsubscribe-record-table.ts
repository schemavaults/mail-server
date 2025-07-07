import type {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "@schemavaults/dbh";
import z from "zod";

export const mailingListUnsubscribeRecordTableRowSchema = z.object({
  mailing_list_id: z.string().uuid(),
  unsubscribe_time: z.number().nonnegative(),
  email: z.string().email(),
});

export type MailingListUnsubscribeTable = z.infer<
  typeof mailingListUnsubscribeRecordTableRowSchema
>;

export type MailingListUnsubscribeRecord =
  Selectable<MailingListUnsubscribeTable>;
export type NewMailingListUnsubscribeRecord =
  Insertable<MailingListUnsubscribeTable>;
export type MailingListUnsubscribeRecordUpdate =
  Updateable<MailingListUnsubscribeTable>;
