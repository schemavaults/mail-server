import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import type { MailingListSubscriber } from "./mailing-list-subscriber-table";
import type { PendingSubscription } from "./pending-subscriptions-table";

export interface CreatePendingSubscriptionInput {
  mailing_list_id: MailingListDefinition["mailing_list_id"];
  email: string;
  token_hash: string;
  ttl_ms: number;
}

export interface CreatePendingSubscriptionResult {
  pending_subscription_id: string;
  expires_at: number;
}

export interface IMailingListRegistry {
  listMailingLists: (
    query_type: "public" | "all",
  ) => Promise<readonly MailingListDefinition[]>;
  createMailingList: (newMailingList: MailingListDefinition) => Promise<void>;
  joinMailingList: (
    mailingListId: MailingListDefinition["mailing_list_id"],
    email: string,
  ) => Promise<void>;
  leaveMailingList: (
    mailingListId: MailingListDefinition["mailing_list_id"],
    email: string,
  ) => Promise<void>;
  listSubscribers: (
    mailingListId: MailingListDefinition["mailing_list_id"],
  ) => Promise<readonly MailingListSubscriber[]>;
  getMailingList: (
    mailingListId: MailingListDefinition["mailing_list_id"],
  ) => Promise<MailingListDefinition>;
  isAlreadySubscribed: (
    mailingListId: MailingListDefinition["mailing_list_id"],
    email: string,
  ) => Promise<boolean>;
  createPendingSubscription: (
    input: CreatePendingSubscriptionInput,
  ) => Promise<CreatePendingSubscriptionResult>;
  findPendingSubscriptionByTokenHash: (
    token_hash: string,
  ) => Promise<PendingSubscription | null>;
  markPendingSubscriptionConfirmed: (
    pending_subscription_id: string,
    now: number,
  ) => Promise<void>;
}
