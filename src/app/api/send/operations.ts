import "server-only";

import { isOperationError } from "@schemavaults/openapi-operations";
import { z } from "@/lib/zod-openapi";
import { apiKeyIdOf, defineOperation } from "@/lib/api/define-operation";
import { apiKeyOrAdminAuth } from "@/lib/api/auth-schemes";
import { badRequest, forbidden, internalError } from "@/lib/api/errors";
import { errorResponses, messageResponse } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import sendEmailFromTemplate from "@/lib/send-email-from-template";
import DefaultMailSenderAddress from "@/lib/DefaultMailSenderAddress";
import dispatchEmail from "@/lib/send-email";
import {
  emailTemplateIdSchema,
  type EmailTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import {
  extractEmailAddress,
  senderMatchesAllowlist,
} from "@/lib/api-keys/sender-scope";
import { evaluateAudienceScope } from "@/lib/api-keys/audience-scope";
import {
  isMailTransportKind,
  loadMailTransportsAvailability,
  MAIL_TRANSPORT_KINDS,
  TEST_DATABASE_MAIL_TRANSPORT,
  type IMailTransportsAvailability,
  type MailTransportKind,
} from "@/lib/mail-transport";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import {
  MailingListRegistry,
  MailKeysRegistry,
  MailTransportSettingsRegistry,
} from "@/lib/mail-db";
import { sendEmailRequestBodySchema } from "./send-email-request-body-schema";

const uuidSchema = z.string().uuid();

// Cap on `to` recipients per send call, applied to every transport. Matches
// the limit the Resend API enforces per call; SMTP sends keep the same cap so
// mailing-list behavior is identical regardless of the configured transport.
const MAX_RECIPIENTS_PER_SEND = 50;

/**
 * Sends an email. Accepts either a mail-server API key or an admin access
 * token (scopes bypassed, keeping the in-app /admin/send-email page working);
 * the validation, template rendering, and dispatch behavior is identical
 * regardless of how the caller authenticated.
 *
 * API-key callers are held to the key's scopes. The transport and sender
 * dimensions are unrestricted when they have zero configured entries:
 * - transports: the resolved transport (explicit `transport` property, or
 *   the deployment default) must be in the key's allowed transports.
 * - senders: `from` (after default fallback) and `replyTo` must match the
 *   key's allowed sender entries (exact address or `*@domain`).
 * The audience dimension is the exception: it is never implicitly
 * unrestricted. A key may send to any recipient ONLY when its
 * `allow_any_audience` flag is set; otherwise its mailing-list and
 * individual-recipient entries form ONE combined allowlist (a single
 * allowlisted mailing list UUID in `to`, or individual addresses that are all
 * allowlisted; cc/bcc addresses must be allowlisted individuals too), and a
 * key with no entries at all may not send to anyone.
 */
export const sendEmail = defineOperation({
  method: "post",
  path: "/api/send",
  operationId: "sendEmail",
  tags: [OPENAPI_TAGS.send],
  summary: "Send an email",
  description:
    "Sends a transactional email or a mailing-list send (when `to` is a mailing-list UUID).",
  auth: apiKeyOrAdminAuth(
    "API-key callers are checked against the key's audience, sender, and transport scopes; admins bypass all scopes.",
  ),
  request: {
    body: {
      contentType: "application/json",
      schema: sendEmailRequestBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: messageResponse("The email was sent (or validated, for dry runs)."),
    ...errorResponses({
      400: "Invalid request body (including too many or too-large attachments), unknown/unconfigured/admin-disabled transport, invalid template, or empty/oversized mailing list.",
      403: "The API key's audience, sender, or transport scope forbids this send (or the access token is not an admin's).",
      500: "Failed to prepare or dispatch the email.",
    }),
  },
  handler: async (ctx) => {
    const apiKeyId: string | null = apiKeyIdOf(ctx.auth);
    const sendEmailOpts = ctx.body;
    const dryRun: boolean = sendEmailOpts.dryRun === true;

    const subject: string = sendEmailOpts.subject;
    let to: string | string[] = sendEmailOpts.to;
    const from: string =
      typeof sendEmailOpts.from === "string"
        ? sendEmailOpts.from
        : DefaultMailSenderAddress;

    const toIsUuid: boolean =
      typeof to === "string" && uuidSchema.safeParse(to).success;

    // ---- Transport resolution ----
    // An explicitly requested transport must be a known id AND configured on
    // this deployment (400 otherwise, dryRun included). An omitted transport
    // resolves to the deployment default without a configured-check, so
    // dryRun requests keep working on deployments with no transport
    // configured; a real send through an unconfigured default still surfaces
    // the config error at dispatch, as it always has.
    let transportAvailability: IMailTransportsAvailability;
    try {
      transportAvailability = loadMailTransportsAvailability();
    } catch (e: unknown) {
      console.error("Failed to resolve mail transport availability: ", e);
      throw internalError("Mail transport configuration is invalid!");
    }
    const requestedTransport: string | undefined = sendEmailOpts.transport;
    if (requestedTransport !== undefined) {
      if (!isMailTransportKind(requestedTransport)) {
        throw badRequest(
          `Unknown transport '${requestedTransport}'! Expected one of: ${MAIL_TRANSPORT_KINDS.join(", ")}.`,
          "unknown_transport",
        );
      }
      if (!transportAvailability.configured.includes(requestedTransport)) {
        throw badRequest(
          `Transport '${requestedTransport}' is not configured on this server.`,
          "transport_not_configured",
        );
      }
    }
    const transportId: MailTransportKind =
      requestedTransport !== undefined &&
      isMailTransportKind(requestedTransport)
        ? requestedTransport
        : transportAvailability.defaultTransport;

    // The test-database transport carries a runtime admin kill switch on top
    // of its env opt-in (toggled at /admin/transports), so real users can be
    // locked out of fake sending without a redeploy. Enforce it here for a
    // clean 400; the transport itself re-checks at dispatch as defense in
    // depth. Mirroring the configured-check above, a dryRun that merely
    // *defaults* to this transport is exempt so dryRun validation keeps
    // working regardless of transport state.
    if (
      transportId === TEST_DATABASE_MAIL_TRANSPORT &&
      (requestedTransport !== undefined || !dryRun)
    ) {
      let enabled: boolean;
      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const settings = new MailTransportSettingsRegistry(dbh);
        enabled = await settings.isTransportEnabled(
          TEST_DATABASE_MAIL_TRANSPORT,
        );
      } catch (e: unknown) {
        console.error(
          `Failed to check whether the '${TEST_DATABASE_MAIL_TRANSPORT}' transport is enabled: `,
          e,
        );
        throw internalError("Failed to check mail transport settings!");
      }
      if (!enabled) {
        throw badRequest(
          `Transport '${TEST_DATABASE_MAIL_TRANSPORT}' has been disabled by an administrator.`,
          "transport_disabled",
        );
      }
    }

    // Open a single ServerlessDatabase handle for the lifetime of any DB
    // work this request needs (scope lookup + mailing-list expansion).
    // If neither path runs we skip opening the handle entirely.
    let resolvedFromMailingListId: string | null = null;
    const needsDb: boolean = apiKeyId !== null || toIsUuid;
    if (needsDb) {
      try {
        await using dbh = ServerlessDatabase.getAsyncResource();

        // ---- Scope enforcement (API-key callers only) ----
        if (apiKeyId !== null) {
          const keysRegistry = new MailKeysRegistry(dbh);
          const scopes = await keysRegistry.getApiKeyScopes(apiKeyId);

          // Transport scope: the resolved transport (explicit or default)
          // must be allowlisted.
          if (
            scopes.allowedTransportIds.length > 0 &&
            !scopes.allowedTransportIds.includes(transportId)
          ) {
            throw forbidden(
              `This API key is not permitted to use the '${transportId}' mail transport.`,
              "transport_not_permitted",
            );
          }

          // Sender scope: `from` (after default fallback) and `replyTo` must
          // both match the key's allowed sender entries.
          if (scopes.allowedSenders.length > 0) {
            const fromAddress = extractEmailAddress(from);
            if (!senderMatchesAllowlist(fromAddress, scopes.allowedSenders)) {
              throw forbidden(
                `This API key is not permitted to send from '${fromAddress}'.`,
                "sender_not_permitted",
              );
            }
            if (sendEmailOpts.replyTo !== undefined) {
              const replyToAddress = extractEmailAddress(
                sendEmailOpts.replyTo,
              );
              if (
                !senderMatchesAllowlist(replyToAddress, scopes.allowedSenders)
              ) {
                throw forbidden(
                  `This API key is not permitted to set '${replyToAddress}' as the reply-to address.`,
                  "sender_not_permitted",
                );
              }
            }
          }

          // Audience scope: sending to any recipient requires the key's
          // explicit `allow_any_audience` flag. Without it, the mailing-list
          // + individual-recipient entries form one combined allowlist, and a
          // key with no entries may not send to anyone.
          const audienceDecision = evaluateAudienceScope(
            {
              allowAnyAudience: scopes.allowAnyAudience,
              allowedMailingListIds: scopes.allowedMailingListIds,
              allowedRecipientEmails: scopes.allowedRecipientEmails,
            },
            {
              to,
              toIsMailingListId: toIsUuid,
              cc: sendEmailOpts.cc ?? undefined,
              bcc: sendEmailOpts.bcc ?? undefined,
            },
          );
          if (!audienceDecision.allowed) {
            throw forbidden(audienceDecision.message, "audience_not_permitted");
          }
        }

        // ---- Mailing list expansion (any caller, when `to` is a UUID) ----
        if (toIsUuid) {
          const mailingListId: string = to as string;
          const mailRegistry = new MailingListRegistry(dbh);

          const [subscribers, unsubscribeRows] = await Promise.all([
            mailRegistry.listSubscribers(mailingListId),
            dbh.db
              .selectFrom("unsubscribe_records")
              .select("email")
              .where("mailing_list_id", "=", mailingListId)
              .execute(),
          ]);

          const unsubscribed = new Set<string>(
            unsubscribeRows.map((row) => row.email.toLowerCase()),
          );

          const seen = new Set<string>();
          const recipients: string[] = [];
          for (const sub of subscribers) {
            const normalized = sub.email.toLowerCase();
            if (unsubscribed.has(normalized)) continue;
            if (seen.has(normalized)) continue;
            seen.add(normalized);
            recipients.push(sub.email);
          }

          if (recipients.length === 0) {
            throw badRequest(
              "Mailing list has no active subscribers.",
              "empty_mailing_list",
            );
          }
          if (recipients.length > MAX_RECIPIENTS_PER_SEND) {
            throw badRequest(
              `Mailing list has more than ${MAX_RECIPIENTS_PER_SEND} active subscribers; per-send recipient limit exceeded.`,
              "too_many_recipients",
            );
          }

          to = recipients;
          resolvedFromMailingListId = mailingListId;
        }
      } catch (e: unknown) {
        if (isOperationError(e)) throw e;
        console.error(
          `Failed to prepare send (apiKeyId='${apiKeyId ?? "none"}', to='${
            typeof sendEmailOpts.to === "string"
              ? sendEmailOpts.to
              : "<array>"
          }'): `,
          e,
        );
        throw internalError("Failed to prepare email for sending!");
      }
    }

    const baseEmailOpts = {
      subject,
      to,
      from,
      replyTo: sendEmailOpts.replyTo ?? undefined,
      cc: sendEmailOpts.cc ?? undefined,
      bcc: sendEmailOpts.bcc ?? undefined,
      transport: transportId,
      attachments: sendEmailOpts.attachments ?? undefined,
    };

    // Transports throw on delivery failure (see IMailTransport), so any
    // non-thrown return here means the send was accepted.
    try {
      if ("template_id" in sendEmailOpts.message) {
        const parsed_template_id = await emailTemplateIdSchema.safeParseAsync(
          sendEmailOpts.message.template_id,
        );
        if (!parsed_template_id.success) {
          throw badRequest("Invalid template ID!", "invalid_template_id");
        }
        const template_id: EmailTemplateId = parsed_template_id.data;

        await sendEmailFromTemplate({
          ...baseEmailOpts,
          message: {
            template_id,
            template_props: sendEmailOpts.message.template_props as any,
          },
          dryRun,
        });
      } else if (!dryRun) {
        await dispatchEmail({
          ...baseEmailOpts,
          text: sendEmailOpts.message.text,
          html: sendEmailOpts.message.html,
        });
      }
    } catch (e: unknown) {
      if (isOperationError(e)) throw e;
      if (e instanceof BadEmailTemplatePropsError) {
        console.error(
          "Error sending email — invalid template props: ",
          e.message,
        );
        throw badRequest(e.message, "invalid_template_props");
      }

      console.error("Error sending email: ", e);

      throw internalError(
        typeof e === "object" &&
          !!e &&
          "message" in e &&
          typeof e.message === "string"
          ? e.message
          : "An unknown error has occurred while attempting to send email!",
        "send_failed",
      );
    }

    const authLogTag: string =
      apiKeyId !== null ? ` [api_key=${apiKeyId}]` : "";
    const dryRunLogTag: string = dryRun ? " [dry-run]" : "";
    const transportLogTag: string = ` [transport=${transportId}]`;
    const verb: string = dryRun ? "validated email send to" : "sent email to";
    if (resolvedFromMailingListId !== null) {
      console.log(
        `[/api/send]${authLogTag}${dryRunLogTag}${transportLogTag} Successfully ${verb} mailing list '${resolvedFromMailingListId}' (${(to as string[]).length} recipients): `,
        to,
      );
    } else {
      console.log(
        `[/api/send]${authLogTag}${dryRunLogTag}${transportLogTag} Successfully ${verb}: `,
        to,
      );
    }

    return ctx.json(200, {
      success: true,
      message: "Successfully sent email!",
    });
  },
});
