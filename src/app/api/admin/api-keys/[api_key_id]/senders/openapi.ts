import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { registerApiKeyScopePaths } from "../scope-route-openapi";
import { senderMutationBodySchema } from "../scope-body-schemas";
import { allowedSenderEntrySchema } from "@/lib/api-keys/sender-scope";

export function registerApiKeySendersPaths(registry: OpenAPIRegistry): void {
  registerApiKeyScopePaths(registry, {
    segment: "senders",
    bodySchema: senderMutationBodySchema,
    entrySchema: allowedSenderEntrySchema,
    scopeName: "allowed-senders scope",
    entryName: "sender",
    description:
      "With zero entries the sender dimension is unrestricted; otherwise the send's `from` (after default fallback) and `replyTo` must each match an entry (exact address or `*@domain` wildcard).",
  });
}
