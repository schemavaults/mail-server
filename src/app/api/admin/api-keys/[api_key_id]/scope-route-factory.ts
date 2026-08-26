import "server-only";

import type { Context, Hono } from "hono";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import {
  parseJsonBody,
  type ZodLikeSchema,
} from "@/lib/hono/parse-json-body";
import { parseUuidParam } from "@/lib/hono/parse-uuid-param";
import {
  badRequest,
  internalServerError,
  jsonData,
  jsonMessage,
} from "@/lib/hono/responses";
import { isFkViolation } from "@/lib/mail-db/is-fk-violation";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";

export interface IApiKeyScopeRouteMessages {
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

export interface IApiKeyScopeRouteOptions<TBody> {
  /** Trailing path segment under /api/admin/api-keys/:api_key_id/. */
  segment: "allowlist" | "recipients" | "senders" | "transports";
  /** Schema for the POST/DELETE mutation body. */
  bodySchema: ZodLikeSchema<TBody>;
  /** Extracts the scope entry value from a parsed mutation body. */
  entryFromBody: (body: TBody) => string;
  /** Shape hint for the invalid-body 400, e.g. "{ mailing_list_id }". */
  expectedBodyShape: string;
  /** Noun used in parse-failure logs, e.g. "allowlist" → "add-allowlist request body". */
  parseLogNoun: string;
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
  messages: IApiKeyScopeRouteMessages;
}

/** "Failed to list API key allowlist!" → "Failed to list API key allowlist: " */
function logPrefix(message: string): string {
  return `${message.replace(/!$/, "")}: `;
}

/**
 * The four API-key scope routes (audience mailing lists, audience
 * recipients, allowed senders, allowed transports) are structurally
 * identical: admin-guarded GET (list entries) / POST (add entry) / DELETE
 * (remove entry) keyed by the :api_key_id path param. This factory builds
 * one such route's Hono app from what actually differs — the body schema,
 * the MailKeysRegistry calls, and the user-facing messages.
 *
 * See ./scope-route-openapi.ts for the matching OpenAPI registration
 * factory.
 */
export function createApiKeyScopeRouteApp<TBody>(
  opts: IApiKeyScopeRouteOptions<TBody>,
): Hono {
  const app = createRouteApp(
    `/api/admin/api-keys/:api_key_id/${opts.segment}`,
  );

  app.get("/", (c) =>
    runWithAdminGuard(c, async () => {
      const keyId = parseUuidParam(c, "api_key_id");
      if (!keyId.ok) return keyId.response;

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        const data = await opts.list(registry, keyId.value);
        return jsonData(c, data);
      } catch (e: unknown) {
        console.error(logPrefix(opts.messages.listError), e);
        return internalServerError(c, opts.messages.listError);
      }
    }),
  );

  const mutationHandler = (action: "add" | "remove") => (c: Context) =>
    runWithAdminGuard(c, async () => {
      const keyId = parseUuidParam(c, "api_key_id");
      if (!keyId.ok) return keyId.response;

      const body = await parseJsonBody(c, opts.bodySchema, {
        fallbackMessage: `Invalid request body; expected ${opts.expectedBodyShape}.`,
        logLabel: `${action}-${opts.parseLogNoun} request body`,
      });
      if (!body.ok) return body.response;
      const entry = opts.entryFromBody(body.data);

      const successMessage =
        action === "add"
          ? opts.messages.addSuccess
          : opts.messages.removeSuccess;
      const errorMessage =
        action === "add" ? opts.messages.addError : opts.messages.removeError;

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        if (action === "add") {
          await opts.add(registry, keyId.value, entry);
        } else {
          await opts.remove(registry, keyId.value, entry);
        }
        return jsonMessage(c, successMessage);
      } catch (e: unknown) {
        if (action === "add" && isFkViolation(e)) {
          return badRequest(c, opts.messages.addFkViolation);
        }
        console.error(logPrefix(errorMessage), e);
        return internalServerError(c, errorMessage);
      }
    });

  app.post("/", mutationHandler("add"));
  app.delete("/", mutationHandler("remove"));

  return app;
}

export default createApiKeyScopeRouteApp;
