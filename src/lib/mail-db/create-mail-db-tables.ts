import { sql, type Kysely } from "@schemavaults/dbh";
import type { MailDatabase } from "./mail-database-type";

export async function createMailDatabaseTables(
  db: Kysely<MailDatabase>,
): Promise<void> {
  const createMailingListsTablePromise: Promise<unknown> =
    sql`CREATE TABLE IF NOT EXISTS MAILING_LISTS (
    mailing_list_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    public BOOL NOT NULL,
    created_at BIGINT NOT NULL
  );`.execute(db);

  await createMailingListsTablePromise;

  const createMailingListSubscribersTablePromise =
    sql`CREATE TABLE IF NOT EXISTS SUBSCRIBERS (
    mailing_list_id UUID TEXT NOT NULL,
    subscribe_time BIGINT NOT NULL,
    email TEXT NOT NULL,
    CONSTRAINT fk_mail_list FOREIGN KEY (mailing_list_id) REFERENCES MAILING_LISTS(mailing_list_id) ON DELETE CASCADE
  );`.execute(db);

  const createMailingListUnsubscribeRecordsTablePromise =
    sql`CREATE TABLE IF NOT EXISTS UNSUBSCRIBE_RECORDS (
    mailing_list_id UUID TEXT NOT NULL,
    unsubscribe_time BIGINT NOT NULL,
    email TEXT NOT NULL,
    CONSTRAINT fk_mail_list FOREIGN KEY (mailing_list_id) REFERENCES MAILING_LISTS(mailing_list_id) ON DELETE CASCADE
  );`.execute(db);

  await Promise.all([
    createMailingListSubscribersTablePromise,
    createMailingListUnsubscribeRecordsTablePromise,
  ]);
}

export default createMailDatabaseTables;
