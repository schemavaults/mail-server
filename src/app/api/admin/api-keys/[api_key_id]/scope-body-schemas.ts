import { z } from "@/lib/zod-openapi";
import { allowedSenderEntrySchema } from "@/lib/api-keys/sender-scope";
import { mailTransportKindSchema } from "@/lib/mail-transport/transport-kind-schema";

// Request bodies for the four API-key scope routes (allowlist, recipients,
// senders, transports). Shared between each subroute's Hono app (built via
// ./scope-route-factory) and its OpenAPI registration (./scope-route-openapi).

export const allowlistMutationBodySchema = z
  .object({
    mailing_list_id: z.string().uuid().openapi({
      description: "Mailing list to add to / remove from the key's audience.",
    }),
  })
  .openapi("ApiKeyAllowlistMutationBody");

export const recipientMutationBodySchema = z
  .object({
    email: z.string().trim().toLowerCase().email().openapi({
      description:
        "Individual recipient address to add to / remove from the key's audience.",
      example: "customer@example.com",
    }),
  })
  .openapi("ApiKeyRecipientMutationBody");

export const senderMutationBodySchema = z
  .object({
    sender: allowedSenderEntrySchema,
  })
  .openapi("ApiKeySenderMutationBody");

export const transportMutationBodySchema = z
  .object({
    transport_id: mailTransportKindSchema,
  })
  .openapi("ApiKeyTransportMutationBody");
