import type {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "@schemavaults/dbh";
import z from "zod";

export const mailingListSubscriberTableRowSchema = z.object({
  mailing_list_id: z.string().uuid(),
  subscribe_time: z.number().nonnegative(),
  email: z.string().email(),
});

export type MailingListSubscriberTable = z.infer<
  typeof mailingListSubscriberTableRowSchema
>;

export type MailingListSubscriber = Selectable<MailingListSubscriberTable>;
export type NewMailingListSubscriber = Insertable<MailingListSubscriberTable>;
export type MailingListSubscriberUpdate =
  Updateable<MailingListSubscriberTable>;
