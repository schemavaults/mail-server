import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { Kysely, Transaction } from "@schemavaults/dbh";
import type { MailDatabase } from "./mail-database-type";
import {
  mailingListDefinition,
  type MailingListDefinition,
} from "@/lib/mailing-list-definition";
import {
  mailingListSubscriberTableRowSchema,
  type MailingListSubscriber,
} from "./mailing-list-subscriber-table";
import {
  mailingListUnsubscribeRecordTableRowSchema,
  type MailingListUnsubscribeRecord,
  type MailingListUnsubscribeTable,
} from "./mailing-list-unsubscribe-record-table";

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
    trx?: Transaction<MailDatabase>,
  ) => Promise<readonly MailingListSubscriber[]>;
}

export class MailingListRegistry implements IMailingListRegistry {
  private readonly dbh: ServerlessDatabase;
  private readonly debug: boolean;

  private get db(): Kysely<MailDatabase> {
    return this.dbh.db;
  }

  public constructor(dbh: ServerlessDatabase, debug: boolean = false) {
    this.dbh = dbh;
    this.debug = debug;
  }

  private isValidMailingListDefinition(
    maybe_mailing_list_obj: unknown,
  ): maybe_mailing_list_obj is MailingListDefinition {
    const parsed = mailingListDefinition.safeParse(maybe_mailing_list_obj);
    if (!parsed.success) {
      return false;
    } else {
      return true;
    }
  }

  private parseMailingListDefiniton(
    value: MailingListDefinition,
  ): MailingListDefinition {
    return {
      ...value,
      created_at:
        typeof value.created_at === "number"
          ? value.created_at
          : Number.parseInt(value.created_at),
    };
  }

  public async listMailingLists(
    query_type: "public" | "all",
  ): Promise<readonly MailingListDefinition[]> {
    const listQuery = this.db.selectFrom("mailing_lists").selectAll();
    const result = await listQuery.execute();
    const parsed = result.map(this.parseMailingListDefiniton);
    if (!parsed.every(this.isValidMailingListDefinition)) {
      throw new Error(
        "Failed to parse mailing list definitions from database!",
      );
    }
    if (query_type === "public") {
      return parsed.filter(
        (ml) => ml.public,
      ) satisfies readonly MailingListDefinition[];
    }
    return parsed satisfies readonly MailingListDefinition[];
  }

  public async createMailingList(
    mailing_list: MailingListDefinition,
  ): Promise<void> {
    if (!this.isValidMailingListDefinition(mailing_list)) {
      throw new Error(
        "Invalid mailing list definition to insert as a row into database!",
      );
    }
    await this.db.insertInto("mailing_lists").values(mailing_list).execute();
  }

  private isValidMailingListSubscriberDefinition(
    maybe_mailing_list_subscriber_ref_obj: unknown,
  ): maybe_mailing_list_subscriber_ref_obj is MailingListSubscriber {
    const parsed = mailingListSubscriberTableRowSchema.safeParse(
      maybe_mailing_list_subscriber_ref_obj,
    );
    if (!parsed.success) {
      return false;
    } else {
      return true;
    }
  }

  private isValidMailingListUnsubscribeRecordDefinition(
    maybe_mailing_list_unsubscribe_ref_obj: unknown,
  ): maybe_mailing_list_unsubscribe_ref_obj is MailingListSubscriber {
    const parsed = mailingListUnsubscribeRecordTableRowSchema.safeParse(
      maybe_mailing_list_unsubscribe_ref_obj,
    );
    if (!parsed.success) {
      return false;
    } else {
      return true;
    }
  }

  public async joinMailingList(
    mailing_list_id: MailingListDefinition["mailing_list_id"],
    email: string,
  ): Promise<void> {
    const newSubscriberDefinition: MailingListSubscriber = {
      mailing_list_id,
      email,
      subscribe_time: Date.now(),
    };

    if (!this.isValidMailingListSubscriberDefinition(newSubscriberDefinition)) {
      throw new Error(
        "Failed to create row to insert into mailing list subscribers table!",
      );
    }

    await this.db
      .insertInto("subscribers")
      .values(newSubscriberDefinition)
      .execute();
  }

  public async leaveMailingList(
    mailing_list_id: MailingListDefinition["mailing_list_id"],
    email: string,
  ): Promise<void> {
    const newUnsubscribeRecord: MailingListUnsubscribeRecord = {
      mailing_list_id,
      email,
      unsubscribe_time: Date.now(),
    };

    if (
      !this.isValidMailingListUnsubscribeRecordDefinition(newUnsubscribeRecord)
    ) {
      throw new Error(
        "Failed to create new row to insert new unsubscribe record into mailing lists database!",
      );
    }

    await this.db
      .insertInto("unsubscribe_records")
      .values(newUnsubscribeRecord)
      .execute();
  }

  public async listSubscribers(
    mailing_list_id: MailingListDefinition["mailing_list_id"],
    trx?: Transaction<MailDatabase>,
  ): Promise<readonly MailingListSubscriber[]> {
    const executor = trx ?? this.db;
    const result = await executor
      .selectFrom("subscribers")
      .selectAll()
      .where("mailing_list_id", "=", mailing_list_id)
      .execute();

    if (!result.every(this.isValidMailingListSubscriberDefinition)) {
      throw new Error("Failed to parse subscriber definitions from database!");
    }

    return result satisfies readonly MailingListSubscriber[];
  }
}
