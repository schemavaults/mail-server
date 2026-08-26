import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonRequestBody,
  messageResponse,
  errorResponses,
  adminOrApiKeySecurity,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { mailTransportKindSchema } from "@/lib/mail-transport/transport-kind-schema";

// Documentation mirror of createSendEmailRequestBodySchema(true) from
// @schemavaults/send-email. The route validates with the package's own
// schema (which bundles zod v3, so it can't feed zod-to-openapi directly);
// this schema exists to describe the same shape in the OpenAPI document.
// Keep the two in sync when the package's schema changes.

const templateMessageSchema = z
  .object({
    template_id: z.string().openapi({
      description:
        "Name of a template from this server's catalog (see GET /api/templates).",
      example: "mailing-list-confirmation",
    }),
    template_props: z.unknown().optional().openapi({
      description: "Props passed to the react-email template component.",
    }),
  })
  .openapi("SendEmailTemplateMessage");

const rawMessageSchema = z
  .object({
    text: z.string().openapi({ description: "Plain-text body." }),
    html: z.string().openapi({ description: "HTML body." }),
  })
  .openapi("SendEmailRawMessage");

const emailAddressListSchema = z.union([
  z.string().email(),
  z.array(z.string().email()),
]);

export const sendEmailRequestBodySchema = z
  .object({
    message: z.union([templateMessageSchema, rawMessageSchema]).openapi({
      description:
        "Either a template reference (rendered server-side via react-email) or a raw text+html body.",
    }),
    to: z
      .union([
        z.string().email(),
        z.array(z.string().email()).max(50),
        z.string().uuid(),
      ])
      .openapi({
        description:
          "Recipient email address, array of addresses (max 50), or a mailing-list UUID — the send then goes to every active (non-unsubscribed) subscriber of that list.",
      }),
    from: z.string().optional().openapi({
      description:
        "Sender, as a bare address or `Display Name <address>` form. Defaults to the server's configured MAIL_FROM sender.",
      example: "Example <noreply@example.com>",
    }),
    subject: z.string().openapi({ example: "Welcome!" }),
    replyTo: z.string().optional(),
    cc: emailAddressListSchema.optional(),
    bcc: emailAddressListSchema.optional(),
    dryRun: z.boolean().optional().openapi({
      description:
        "When true, validates the request (and renders the template, if any) without dispatching mail.",
    }),
    transport: mailTransportKindSchema.optional().openapi({
      description:
        "Which configured transport should deliver this message. Defaults to the deployment's MAIL_TRANSPORT.",
    }),
  })
  .openapi("SendEmailRequestBody");

export function registerSendPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "post",
    path: "/api/send",
    tags: [OPENAPI_TAGS.send],
    summary: "Send an email",
    description:
      "Sends a transactional email or a mailing-list send (when `to` is a mailing-list UUID). Accepts either an admin JWT or a mail-server API key; API-key callers are checked against the key's audience, sender, and transport scopes — admins bypass all scopes.",
    security: adminOrApiKeySecurity,
    request: {
      body: jsonRequestBody(sendEmailRequestBodySchema),
    },
    responses: {
      200: messageResponse("The email was sent (or validated, for dry runs)."),
      ...errorResponses({
        400: "Invalid request body, unknown/unconfigured/admin-disabled transport, invalid template, or empty/oversized mailing list.",
        401: "Missing or invalid credentials.",
        403: "The API key's audience, sender, or transport scope forbids this send.",
        500: "Failed to prepare or dispatch the email.",
      }),
    },
  });
}
