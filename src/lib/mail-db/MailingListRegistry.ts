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
import {
  pendingSubscriptionRowSchema,
  type PendingSubscription,
} from "./pending-subscriptions-table";
import type {
  CreatePendingSubscriptionInput,
  CreatePendingSubscriptionResult,
  IMailingListRegistry,
} from "./IMailingListRegistry";

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
    let listQuery = this.db.selectFrom("mailing_lists").selectAll();
    if (query_type === "public") {
      listQuery = listQuery.where("public", "=", true);
    }
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
      console.error(
        "Received bad mailing list subscriber row!",
        { row: maybe_mailing_list_subscriber_ref_obj, issues: parsed.error.issues },
      );
      return false;
    }
    return true;
  }

  private parseMailingListSubscriberDefinition(
    mailing_list_subscriber_row: MailingListSubscriber,
  ): MailingListSubscriber {
    return {
      ...mailing_list_subscriber_row,
      subscribe_time:
        typeof mailing_list_subscriber_row["subscribe_time"] === "number"
          ? mailing_list_subscriber_row["subscribe_time"]
          : Number.parseInt(mailing_list_subscriber_row["subscribe_time"]),
    };
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
  ): Promise<readonly MailingListSubscriber[]> {
    const result = await this.db
      .selectFrom("subscribers")
      .selectAll()
      .where("mailing_list_id", "=", mailing_list_id)
      .orderBy("subscribe_time", "desc")
      .execute();

    const parsed = result.map(this.parseMailingListSubscriberDefinition);

    if (!parsed.every(this.isValidMailingListSubscriberDefinition)) {
      throw new Error("Failed to parse subscriber definitions from database!");
    }

    return parsed satisfies readonly MailingListSubscriber[];
  }

  public async isAlreadySubscribed(
    mailing_list_id: MailingListDefinition["mailing_list_id"],
    email: string,
  ): Promise<boolean> {
    const result = await this.db
      .selectFrom("subscribers")
      .select("email")
      .where("mailing_list_id", "=", mailing_list_id)
      .where("email", "=", email)
      .executeTakeFirst();
    return Boolean(result);
  }

  public async createPendingSubscription(
    input: CreatePendingSubscriptionInput,
  ): Promise<CreatePendingSubscriptionResult> {
    const now = Date.now();
    const expires_at = now + input.ttl_ms;
    const pending_subscription_id = crypto.randomUUID();

    await this.db
      .insertInto("pending_subscriptions")
      .values({
        pending_subscription_id,
        mailing_list_id: input.mailing_list_id,
        email: input.email,
        token_hash: input.token_hash,
        created_at: now,
        expires_at,
        confirmed_at: null,
      })
      .execute();

    return { pending_subscription_id, expires_at };
  }

  public async findPendingSubscriptionByTokenHash(
    token_hash: string,
  ): Promise<PendingSubscription | null> {
    const result = await this.db
      .selectFrom("pending_subscriptions")
      .selectAll()
      .where("token_hash", "=", token_hash)
      .executeTakeFirst();
    if (!result) {
      return null;
    }
    const normalized = {
      ...result,
      created_at:
        typeof result.created_at === "number"
          ? result.created_at
          : Number.parseInt(result.created_at as unknown as string),
      expires_at:
        typeof result.expires_at === "number"
          ? result.expires_at
          : Number.parseInt(result.expires_at as unknown as string),
      confirmed_at:
        result.confirmed_at === null || result.confirmed_at === undefined
          ? null
          : typeof result.confirmed_at === "number"
            ? result.confirmed_at
            : Number.parseInt(result.confirmed_at as unknown as string),
    };
    const parsed = pendingSubscriptionRowSchema.safeParse(normalized);
    if (!parsed.success) {
      throw new Error("Failed to parse pending subscription row from database!");
    }
    return parsed.data;
  }

  public async markPendingSubscriptionConfirmed(
    pending_subscription_id: string,
    now: number,
  ): Promise<void> {
    await this.db
      .updateTable("pending_subscriptions")
      .set({ confirmed_at: now })
      .where("pending_subscription_id", "=", pending_subscription_id)
      .execute();
  }

  public async getMailingList(
    mailing_list_id: MailingListDefinition["mailing_list_id"],
  ): Promise<MailingListDefinition> {
    const result = await this.db
      .selectFrom("mailing_lists")
      .selectAll()
      .where("mailing_list_id", "=", mailing_list_id)
      .executeTakeFirstOrThrow();
    const parsed = await mailingListDefinition.safeParseAsync(
      this.parseMailingListDefiniton(result) satisfies MailingListDefinition,
    );
    if (!parsed.success) {
      throw parsed.error;
    }
    return parsed.data;
  }
}
