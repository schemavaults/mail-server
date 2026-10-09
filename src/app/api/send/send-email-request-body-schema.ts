import {
  createSendEmailRequestBodySchema,
  MAX_ATTACHMENTS_PER_EMAIL,
  MAX_TOTAL_ATTACHMENT_BYTES,
} from "@schemavaults/send-email";
import { z, withOpenApi } from "@/lib/zod-openapi";

// POST /api/send validates with @schemavaults/send-email's own request body
// schema, so the server and the package's client can never disagree about
// what a valid send looks like. The package builds it with this app's zod
// instance but before the `.openapi()` extension is guaranteed to exist on
// it, so the documentation metadata is attached with `withOpenApi()` on
// copies of the package's field schemas — validation is unchanged.
// (`attachments` in particular must be wrapped, not rebuilt from its element
// schema: a rebuilt array would silently drop the package's count and
// total-size checks.)

const packageSchema = createSendEmailRequestBodySchema(true);
const { shape } = packageSchema;
const [templateMessageSchema, rawMessageSchema] =
  shape.message.unwrap().options;

export const sendEmailRequestBodySchema = withOpenApi(
  packageSchema.extend({
    message: withOpenApi(
      z.union([
        withOpenApi(templateMessageSchema, "SendEmailTemplateMessage", {
          description:
            "A template from this server's catalog (see GET /api/templates), rendered server-side via react-email with `template_props`.",
        }),
        withOpenApi(rawMessageSchema, "SendEmailRawMessage", {
          description: "A raw plain-text + HTML body.",
        }),
      ]),
      {
        description:
          "Either a template reference (rendered server-side via react-email) or a raw text+html body.",
      },
    ),
    to: withOpenApi(shape.to, {
      description:
        "Recipient email address, array of addresses (max 50), or a mailing-list UUID — the send then goes to every active (non-unsubscribed) subscriber of that list.",
    }),
    from: withOpenApi(shape.from, {
      description:
        "Sender address. Defaults to the server's configured MAIL_FROM sender.",
      example: "noreply@example.com",
    }),
    subject: withOpenApi(shape.subject, { example: "Welcome!" }),
    replyTo: withOpenApi(shape.replyTo, {
      description: "Reply-to address.",
    }),
    dryRun: withOpenApi(shape.dryRun, {
      description:
        "When true, validates the request (and renders the template, if any) without dispatching mail.",
    }),
    transport: withOpenApi(shape.transport, {
      description:
        "Which configured transport should deliver this message (`resend`, `smtp`, or `test-database-transport`). Defaults to the deployment's MAIL_TRANSPORT.",
      example: "resend",
    }),
    attachments: withOpenApi(shape.attachments, {
      description: `Files to attach (1–${MAX_ATTACHMENTS_PER_EMAIL}, at most ${MAX_TOTAL_ATTACHMENT_BYTES / (1024 * 1024)} MiB in total once decoded). Each carries its bytes base64-encoded in \`content\`; an omitted \`contentType\` is derived from the filename by the delivering transport, and setting \`contentId\` sends the file inline so the HTML body can reference it as \`cid:<contentId>\`. The hosting platform may cap the request body below this limit.`,
    }),
  }),
  "SendEmailRequestBody",
  {
    description:
      "An email to send: a raw or templated message to individual recipients or a mailing list.",
  },
);

export type SendEmailRequestBody = z.output<typeof sendEmailRequestBodySchema>;
