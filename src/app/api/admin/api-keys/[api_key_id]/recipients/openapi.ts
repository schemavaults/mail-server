import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { registerApiKeyScopePaths } from "../scope-route-openapi";
import { recipientMutationBodySchema } from "../scope-body-schemas";
import { z } from "@/lib/zod-openapi";

export function registerApiKeyRecipientsPaths(
  registry: OpenAPIRegistry,
): void {
  registerApiKeyScopePaths(registry, {
    segment: "recipients",
    bodySchema: recipientMutationBodySchema,
    entrySchema: z.string().email().openapi({
      description: "An allowlisted individual recipient address.",
    }),
    scopeName: "audience recipient allowlist",
    entryName: "recipient",
    description:
      "Individual-recipient entries and mailing-list entries form ONE combined audience allowlist for the key (unless the key's allow_any_audience flag is set).",
  });
}
