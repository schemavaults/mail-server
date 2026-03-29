import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import type { MailingListSubscriber } from "./mailing-list-subscriber-table";

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
}
