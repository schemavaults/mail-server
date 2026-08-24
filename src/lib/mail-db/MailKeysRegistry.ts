import "server-only";

import type { Kysely } from "@schemavaults/dbh";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { MailDatabase } from "./mail-database-type";
import {
  apiKeyTableRowSchema,
  type ApiKey,
  type ApiKeyRecord,
} from "./api-keys-table";
import type { ApiKeyAllowedTransportRow } from "./api-key-allowed-transports-table";
import { apiKeyNameSchema } from "@/lib/api-keys/api-key-name";
import { generateApiKey } from "@/lib/api-keys/generateApiKey";
import { hashApiKey } from "@/lib/api-keys/hashApiKey";

export interface CreateApiKeyInput {
  name: string;
  created_by_user_id: string;
}

export interface CreateApiKeyResult {
  api_key_id: string;
  name: string;
  key_prefix: string;
  created_at: number;
  created_by_user_id: string;
  /** Plaintext token. Returned exactly once and never persisted. */
  plaintext: string;
}

export interface ListApiKeysOptions {
  includeRevoked?: boolean;
}

export class MailKeysRegistry {
  private readonly dbh: ServerlessDatabase;

  private get db(): Kysely<MailDatabase> {
    return this.dbh.db;
  }

  public constructor(dbh: ServerlessDatabase) {
    this.dbh = dbh;
  }

  /**
   * Neon returns BIGINT columns as strings; coerce them to numbers so the
   * Zod schema and downstream consumers receive a consistent shape.
   */
  private parseRow(row: ApiKey): ApiKey {
    return {
      ...row,
      created_at:
        typeof row.created_at === "number"
          ? row.created_at
          : Number.parseInt(row.created_at as unknown as string),
      last_used_at:
        row.last_used_at === null || row.last_used_at === undefined
          ? null
          : typeof row.last_used_at === "number"
            ? row.last_used_at
            : Number.parseInt(row.last_used_at as unknown as string),
      revoked_at:
        row.revoked_at === null || row.revoked_at === undefined
          ? null
          : typeof row.revoked_at === "number"
            ? row.revoked_at
            : Number.parseInt(row.revoked_at as unknown as string),
    };
  }

  private toRecord(row: ApiKey): ApiKeyRecord {
    const { key_hash: _key_hash, ...rest } = row;
    void _key_hash;
    return rest;
  }

  public async createApiKey(
    input: CreateApiKeyInput,
  ): Promise<CreateApiKeyResult> {
    const parsedName = apiKeyNameSchema.safeParse(input.name);
    if (!parsedName.success) {
      throw new Error(
        parsedName.error.issues[0]?.message ??
          "API key name must be between 1 and 64 characters.",
      );
    }
    const name = parsedName.data;

    const { plaintext, display_prefix } = generateApiKey();
    const key_hash = await hashApiKey(plaintext);
    const api_key_id = crypto.randomUUID();
    const created_at = Date.now();

    const newRow: ApiKey = {
      api_key_id,
      name,
      key_hash,
      key_prefix: display_prefix,
      created_at,
      created_by_user_id: input.created_by_user_id,
      last_used_at: null,
      revoked_at: null,
    };

    const parsed = apiKeyTableRowSchema.safeParse(newRow);
    if (!parsed.success) {
      throw new Error(
        `Failed to validate new API key row: ${parsed.error.message}`,
      );
    }

    await this.db.insertInto("api_keys").values(newRow).execute();

    return {
      api_key_id,
      name,
      key_prefix: display_prefix,
      created_at,
      created_by_user_id: input.created_by_user_id,
      plaintext,
    };
  }

  public async listApiKeys(
    opts: ListApiKeysOptions = {},
  ): Promise<readonly ApiKeyRecord[]> {
    let query = this.db.selectFrom("api_keys").selectAll();
    if (!opts.includeRevoked) {
      query = query.where("revoked_at", "is", null);
    }
    const result = await query.orderBy("created_at", "desc").execute();
    return result.map((row) => this.toRecord(this.parseRow(row as ApiKey)));
  }

  public async findActiveByPlaintext(
    plaintext: string,
  ): Promise<ApiKeyRecord | null> {
    const key_hash = await hashApiKey(plaintext);
    const row = await this.db
      .selectFrom("api_keys")
      .selectAll()
      .where("key_hash", "=", key_hash)
      .where("revoked_at", "is", null)
      .executeTakeFirst();
    if (!row) return null;
    return this.toRecord(this.parseRow(row as ApiKey));
  }

  /**
   * Renames an existing API key. The key's ID, secret and scopes are left
   * untouched — only the human-facing label changes, so integrations holding
   * the plaintext token keep working. Returns the updated record, or null
   * when no active (non-revoked) key with that ID exists.
   */
  public async renameApiKey(
    api_key_id: string,
    name: string,
  ): Promise<ApiKeyRecord | null> {
    const parsedName = apiKeyNameSchema.safeParse(name);
    if (!parsedName.success) {
      throw new Error(
        parsedName.error.issues[0]?.message ??
          "API key name must be between 1 and 64 characters.",
      );
    }

    const row = await this.db
      .updateTable("api_keys")
      .set({ name: parsedName.data })
      .where("api_key_id", "=", api_key_id)
      .where("revoked_at", "is", null)
      .returningAll()
      .executeTakeFirst();
    if (!row) return null;
    return this.toRecord(this.parseRow(row as ApiKey));
  }

  public async revokeApiKey(api_key_id: string): Promise<void> {
    const revoked_at = Date.now();
    await this.db
      .updateTable("api_keys")
      .set({ revoked_at })
      .where("api_key_id", "=", api_key_id)
      .where("revoked_at", "is", null)
      .execute();
  }

  public async touchLastUsed(api_key_id: string): Promise<void> {
    const last_used_at = Date.now();
    await this.db
      .updateTable("api_keys")
      .set({ last_used_at })
      .where("api_key_id", "=", api_key_id)
      .execute();
  }

  /**
   * Returns the mailing list IDs this API key is permitted to send to.
   * An empty array means the key is unrestricted (legacy behavior — can
   * send to any recipient or mailing list). A non-empty array means the
   * key is scoped: it may ONLY pass one of these mailing list UUIDs in
   * the `to` field on `/api/send`, and cc/bcc are forbidden.
   */
  public async listAllowedMailingListIds(
    api_key_id: string,
  ): Promise<string[]> {
    const rows = await this.db
      .selectFrom("api_key_mailing_list_allowlists")
      .select("mailing_list_id")
      .where("api_key_id", "=", api_key_id)
      .execute();
    return rows.map((row) => row.mailing_list_id);
  }

  /**
   * Adds a mailing list to an API key's allowlist. Idempotent — duplicate
   * inserts are silently ignored via `ON CONFLICT DO NOTHING`. Throws on
   * FK violation (unknown api_key_id or mailing_list_id) so callers can
   * surface a 400 to the admin UI.
   */
  public async addAllowedMailingList(
    api_key_id: string,
    mailing_list_id: string,
  ): Promise<void> {
    await this.db
      .insertInto("api_key_mailing_list_allowlists")
      .values({
        api_key_id,
        mailing_list_id,
        created_at: Date.now(),
      })
      .onConflict((oc) => oc.columns(["api_key_id", "mailing_list_id"]).doNothing())
      .execute();
  }

  /**
   * Removes a mailing list from an API key's allowlist. Idempotent —
   * removing a row that does not exist is a no-op.
   */
  public async removeAllowedMailingList(
    api_key_id: string,
    mailing_list_id: string,
  ): Promise<void> {
    await this.db
      .deleteFrom("api_key_mailing_list_allowlists")
      .where("api_key_id", "=", api_key_id)
      .where("mailing_list_id", "=", mailing_list_id)
      .execute();
  }

  /**
   * Returns the sender entries (lowercase email addresses or `*@domain`
   * wildcards) this API key may use as `from`/`replyTo`. Empty = the key is
   * unrestricted on the sender dimension.
   */
  public async listAllowedSenders(api_key_id: string): Promise<string[]> {
    const rows = await this.db
      .selectFrom("api_key_allowed_senders")
      .select("sender")
      .where("api_key_id", "=", api_key_id)
      .execute();
    return rows.map((row) => row.sender);
  }

  /** Adds a sender entry to an API key's allowed-senders list. Idempotent. */
  public async addAllowedSender(
    api_key_id: string,
    sender: string,
  ): Promise<void> {
    await this.db
      .insertInto("api_key_allowed_senders")
      .values({
        api_key_id,
        sender: sender.trim().toLowerCase(),
        created_at: Date.now(),
      })
      .onConflict((oc) => oc.columns(["api_key_id", "sender"]).doNothing())
      .execute();
  }

  /** Removes a sender entry from an API key's allowed-senders list. Idempotent. */
  public async removeAllowedSender(
    api_key_id: string,
    sender: string,
  ): Promise<void> {
    await this.db
      .deleteFrom("api_key_allowed_senders")
      .where("api_key_id", "=", api_key_id)
      .where("sender", "=", sender.trim().toLowerCase())
      .execute();
  }

  /**
   * Returns the individual (one-off) recipient emails this API key may
   * target in to/cc/bcc. Together with listAllowedMailingListIds these form
   * ONE combined audience allowlist: a row in either restricts the key's
   * audience as a whole.
   */
  public async listAllowedRecipientEmails(
    api_key_id: string,
  ): Promise<string[]> {
    const rows = await this.db
      .selectFrom("api_key_recipient_allowlists")
      .select("email")
      .where("api_key_id", "=", api_key_id)
      .execute();
    return rows.map((row) => row.email);
  }

  /** Adds an individual recipient email to an API key's audience allowlist. Idempotent. */
  public async addAllowedRecipientEmail(
    api_key_id: string,
    email: string,
  ): Promise<void> {
    await this.db
      .insertInto("api_key_recipient_allowlists")
      .values({
        api_key_id,
        email: email.trim().toLowerCase(),
        created_at: Date.now(),
      })
      .onConflict((oc) => oc.columns(["api_key_id", "email"]).doNothing())
      .execute();
  }

  /** Removes an individual recipient email from an API key's audience allowlist. Idempotent. */
  public async removeAllowedRecipientEmail(
    api_key_id: string,
    email: string,
  ): Promise<void> {
    await this.db
      .deleteFrom("api_key_recipient_allowlists")
      .where("api_key_id", "=", api_key_id)
      .where("email", "=", email.trim().toLowerCase())
      .execute();
  }

  /**
   * Returns the transport ids ("resend", "smtp") this API key may deliver
   * through. Empty = the key is unrestricted on the transport dimension.
   */
  public async listAllowedTransportIds(api_key_id: string): Promise<string[]> {
    const rows = await this.db
      .selectFrom("api_key_allowed_transports")
      .select("transport_id")
      .where("api_key_id", "=", api_key_id)
      .execute();
    return rows.map((row) => row.transport_id);
  }

  /** Adds a transport id to an API key's allowed-transports list. Idempotent. */
  public async addAllowedTransport(
    api_key_id: string,
    transport_id: string,
  ): Promise<void> {
    await this.db
      .insertInto("api_key_allowed_transports")
      .values({
        api_key_id,
        transport_id: transport_id.trim().toLowerCase() as ApiKeyAllowedTransportRow["transport_id"],
        created_at: Date.now(),
      })
      .onConflict((oc) => oc.columns(["api_key_id", "transport_id"]).doNothing())
      .execute();
  }

  /** Removes a transport id from an API key's allowed-transports list. Idempotent. */
  public async removeAllowedTransport(
    api_key_id: string,
    transport_id: string,
  ): Promise<void> {
    await this.db
      .deleteFrom("api_key_allowed_transports")
      .where(
        "transport_id",
        "=",
        transport_id.trim().toLowerCase() as ApiKeyAllowedTransportRow["transport_id"],
      )
      .where("api_key_id", "=", api_key_id)
      .execute();
  }

  /**
   * Fetches all four scope lists for a key in parallel — the shape `/api/send`
   * needs to enforce the key's restrictions on a single request.
   */
  public async getApiKeyScopes(api_key_id: string): Promise<ApiKeyScopes> {
    const [
      allowedMailingListIds,
      allowedRecipientEmails,
      allowedSenders,
      allowedTransportIds,
    ] = await Promise.all([
      this.listAllowedMailingListIds(api_key_id),
      this.listAllowedRecipientEmails(api_key_id),
      this.listAllowedSenders(api_key_id),
      this.listAllowedTransportIds(api_key_id),
    ]);
    return {
      allowedMailingListIds,
      allowedRecipientEmails,
      allowedSenders,
      allowedTransportIds,
    };
  }
}

/**
 * All of one API key's scope lists. On every dimension, an empty list means
 * the key is unrestricted on that dimension; the mailing-list and
 * recipient-email lists together form one combined audience allowlist.
 */
export interface ApiKeyScopes {
  allowedMailingListIds: string[];
  allowedRecipientEmails: string[];
  allowedSenders: string[];
  allowedTransportIds: string[];
}

export default MailKeysRegistry;
