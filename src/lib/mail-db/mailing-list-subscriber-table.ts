import type {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "@schemavaults/dbh";
import { z } from "@/lib/zod-openapi";

export const mailingListSubscriberTableRowSchema = z
  .object({
    mailing_list_id: z.string().uuid(),
    subscribe_time: z.number().nonnegative().openapi({
      description: "Subscription time as a Unix timestamp in milliseconds.",
    }),
    email: z.string().email(),
  })
  .openapi("MailingListSubscriber");

export type MailingListSubscriberTable = z.infer<
  typeof mailingListSubscriberTableRowSchema
>;

export type MailingListSubscriber = Selectable<MailingListSubscriberTable>;
export type NewMailingListSubscriber = Insertable<MailingListSubscriberTable>;
export type MailingListSubscriberUpdate =
  Updateable<MailingListSubscriberTable>;
