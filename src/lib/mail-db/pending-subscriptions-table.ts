import type { Insertable, Selectable, Updateable } from "@schemavaults/dbh";
import z from "zod";

export const pendingSubscriptionRowSchema = z.object({
  pending_subscription_id: z.string().uuid(),
  mailing_list_id: z.string().uuid(),
  email: z.string().email(),
  token_hash: z.string().min(1),
  created_at: z.number().nonnegative(),
  expires_at: z.number().nonnegative(),
  confirmed_at: z.number().nonnegative().nullable(),
});

export type PendingSubscriptionsTable = z.infer<
  typeof pendingSubscriptionRowSchema
>;

export type PendingSubscription = Selectable<PendingSubscriptionsTable>;
export type NewPendingSubscription = Insertable<PendingSubscriptionsTable>;
export type PendingSubscriptionUpdate = Updateable<PendingSubscriptionsTable>;
