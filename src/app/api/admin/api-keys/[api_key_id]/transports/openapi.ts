import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { registerApiKeyScopePaths } from "../scope-route-openapi";
import { transportMutationBodySchema } from "../scope-body-schemas";
import { mailTransportKindSchema } from "@/lib/mail-transport/transport-kind-schema";

export function registerApiKeyTransportsPaths(
  registry: OpenAPIRegistry,
): void {
  registerApiKeyScopePaths(registry, {
    segment: "transports",
    bodySchema: transportMutationBodySchema,
    entrySchema: mailTransportKindSchema,
    scopeName: "allowed-transports scope",
    entryName: "transport",
    description:
      "With zero entries the transport dimension is unrestricted; otherwise the send's resolved transport (explicit or deployment default) must be an entry.",
  });
}
