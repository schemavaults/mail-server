import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { badRequest, internalError } from "@/lib/api/errors";
import { uuidParam } from "@/lib/api/params";
import {
  dataResponse,
  errorResponses,
  messageResponse,
} from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { isFkViolation } from "@/lib/mail-db/is-fk-violation";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";

export interface IApiKeyScopeOperationMessages {
  /** 500 message when listing fails, e.g. "Failed to list API key allowlist!" */
  listError: string;
  /** 200 message after a successful add. */
  addSuccess: string;
  /** 500 message when adding fails. */
  addError: string;
  /** 400 message when adding hits a foreign-key violation. */
  addFkViolation: string;
  /** 200 message after a successful remove. */
  removeSuccess: string;
  /** 500 message when removing fails. */
  removeError: string;
}

export interface IApiKeyScopeOperationsOptions<
  TBody extends z.ZodObject,
> {
  /** Trailing path segment under /api/admin/api-keys/{api_key_id}/. */
  segment: "allowlist" | "recipients" | "senders" | "transports";
  /** operationIds of the list / add / remove operations. */
  operationIds: { list: string; add: string; remove: string };
  /** Schema for the POST/DELETE mutation body. */
  bodySchema: TBody;
  /** Extracts the scope entry value from a parsed mutation body. */
  entryFromBody: (body: z.output<TBody>) => string;
  /** Schema describing one listed entry. */
  entrySchema: z.ZodType<string>;
  /** Human name of the scope, e.g. "audience mailing-list allowlist". */
  scopeName: string;
  /** What one entry is, e.g. "mailing list". */
  entryName: string;
  /** Extra description appended to every operation in this scope. */
  description: string;
  list: (registry: MailKeysRegistry, apiKeyId: string) => Promise<string[]>;
  add: (
    registry: MailKeysRegistry,
    apiKeyId: string,
    entry: string,
  ) => Promise<void>;
  remove: (
    registry: MailKeysRegistry,
    apiKeyId: string,
    entry: string,
  ) => Promise<void>;
  messages: IApiKeyScopeOperationMessages;
}

/** "Failed to list API key allowlist!" → "Failed to list API key allowlist: " */
function logPrefix(message: string): string {
  return `${message.replace(/!$/, "")}: `;
}

/**
 * The four API-key scope routes (audience mailing lists, audience
 * recipients, allowed senders, allowed transports) are structurally
 * identical: admin-only GET (list entries) / POST (add entry) / DELETE
 * (remove entry) keyed by the {api_key_id} path param. This factory defines
 * one such route's three operations from what actually differs — the body
 * schema, the MailKeysRegistry calls, and the user-facing messages.
 */
export function defineApiKeyScopeOperations<TBody extends z.ZodObject>(
  opts: IApiKeyScopeOperationsOptions<TBody>,
) {
  const path = `/api/admin/api-keys/{api_key_id}/${opts.segment}`;
  const params = z.object({
    api_key_id: uuidParam("api_key_id", "ID of the API key."),
  });
  // `ctx.body` is the validated body; its type is a conditional over the
  // generic TBody that TypeScript cannot resolve, hence the casts below.
  const body = {
    contentType: "application/json",
    schema: opts.bodySchema,
    lenientContentType: true,
  } as const;

  const list = defineOperation({
    method: "get",
    path,
    operationId: opts.operationIds.list,
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: `List an API key's ${opts.scopeName} entries`,
    description: opts.description,
    auth: adminAuth(),
    request: { params },
    responses: {
      200: dataResponse(
        `The key's ${opts.scopeName} entries.`,
        z.array(opts.entrySchema),
      ),
      ...errorResponses({
        500: `Failed to list the key's ${opts.scopeName} entries.`,
      }),
    },
    handler: async (ctx) => {
      let data: string[];
      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        data = await opts.list(registry, ctx.params.api_key_id);
      } catch (e: unknown) {
        console.error(logPrefix(opts.messages.listError), e);
        throw internalError(opts.messages.listError);
      }
      return ctx.json(200, { success: true, data });
    },
  });

  const mutate = async (
    action: "add" | "remove",
    apiKeyId: string,
    entry: string,
  ): Promise<string> => {
    const errorMessage =
      action === "add" ? opts.messages.addError : opts.messages.removeError;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new MailKeysRegistry(dbh);
      if (action === "add") {
        await opts.add(registry, apiKeyId, entry);
      } else {
        await opts.remove(registry, apiKeyId, entry);
      }
    } catch (e: unknown) {
      if (action === "add" && isFkViolation(e)) {
        throw badRequest(opts.messages.addFkViolation, "unknown_reference");
      }
      console.error(logPrefix(errorMessage), e);
      throw internalError(errorMessage);
    }
    return action === "add"
      ? opts.messages.addSuccess
      : opts.messages.removeSuccess;
  };

  const add = defineOperation({
    method: "post",
    path,
    operationId: opts.operationIds.add,
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: `Add a ${opts.entryName} to an API key's ${opts.scopeName}`,
    description: opts.description,
    auth: adminAuth(),
    request: { params, body },
    responses: {
      200: messageResponse(`The ${opts.entryName} was added.`),
      ...errorResponses({
        400: "Invalid api_key_id, invalid body, or unknown referenced resource.",
        500: `Failed to add the ${opts.entryName}.`,
      }),
    },
    handler: async (ctx) => {
      const message = await mutate(
        "add",
        ctx.params.api_key_id,
        opts.entryFromBody(ctx.body as z.output<TBody>),
      );
      return ctx.json(200, { success: true, message });
    },
  });

  const remove = defineOperation({
    method: "delete",
    path,
    operationId: opts.operationIds.remove,
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: `Remove a ${opts.entryName} from an API key's ${opts.scopeName}`,
    description: opts.description,
    auth: adminAuth(),
    request: { params, body },
    responses: {
      200: messageResponse(`The ${opts.entryName} was removed.`),
      ...errorResponses({
        500: `Failed to remove the ${opts.entryName}.`,
      }),
    },
    handler: async (ctx) => {
      const message = await mutate(
        "remove",
        ctx.params.api_key_id,
        opts.entryFromBody(ctx.body as z.output<TBody>),
      );
      return ctx.json(200, { success: true, message });
    },
  });

  return { list, add, remove };
}

export default defineApiKeyScopeOperations;
