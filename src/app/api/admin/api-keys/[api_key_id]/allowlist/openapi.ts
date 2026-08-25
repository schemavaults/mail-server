import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { registerApiKeyScopePaths } from "../scope-route-openapi";
import { allowlistMutationBodySchema } from "../scope-body-schemas";
import { z } from "@/lib/zod-openapi";

export function registerApiKeyAllowlistPaths(registry: OpenAPIRegistry): void {
  registerApiKeyScopePaths(registry, {
    segment: "allowlist",
    bodySchema: allowlistMutationBodySchema,
    entrySchema: z.string().uuid().openapi({
      description: "An allowlisted mailing list ID.",
    }),
    scopeName: "audience mailing-list allowlist",
    entryName: "mailing list",
    description:
      "Mailing-list entries and individual-recipient entries form ONE combined audience allowlist for the key (unless the key's allow_any_audience flag is set).",
  });
}
