import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSendEmailRequestBodySchema } from "@schemavaults/send-email";
import sendEmailFromTemplate from "@/lib/send-email-from-template";
import DefaultMailSenderAddress from "@/lib/DefaultMailSenderAddress";
import sendEmail from "@/lib/send-email";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import {
  emailTemplateIdSchema,
  type EmailTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import {
  requestLooksLikeApiKeyAuth,
  validateApiKeyFromRequest,
} from "@/lib/api-keys/validateApiKeyFromRequest";
import {
  extractEmailAddress,
  senderMatchesAllowlist,
} from "@/lib/api-keys/sender-scope";
import { evaluateAudienceScope } from "@/lib/api-keys/audience-scope";
import {
  isMailTransportKind,
  loadMailTransportsAvailability,
  MAIL_TRANSPORT_KINDS,
  type IMailTransportsAvailability,
  type MailTransportKind,
} from "@/lib/mail-transport";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry, MailKeysRegistry } from "@/lib/mail-db";

const sendEmailRequestBodySchema = createSendEmailRequestBodySchema(true);
const uuidSchema = z.string().uuid();

// Cap on `to` recipients per send call, applied to every transport. Matches
// the limit the Resend API enforces per call; SMTP sends keep the same cap so
// mailing-list behavior is identical regardless of the configured transport.
const MAX_RECIPIENTS_PER_SEND = 50;

function badRequest(message: string = "Invalid request"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: 400,
    },
  );
}

function unauthorized(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: 401,
    },
  );
}

function forbidden(message: string = "Forbidden"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: 403,
    },
  );
}

function internalServerError(
  message: string = "An unknown error has occurred!",
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: 500,
    },
  );
}

function emailSentSuccessfullyResponse(): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message: "Successfully sent email!",
    },
    {
      status: 200,
    },
  );
}

interface SendAuthContext {
  /** Non-null when the caller authenticated via an API key. */
  apiKeyId: string | null;
}

/**
 * Shared send-email logic. Used by both authentication paths (API key and
 * admin JWT) so the validation, template rendering, and dispatch behavior
 * stays identical regardless of how the caller authenticated.
 *
 * When `auth.apiKeyId` is set, the route enforces the key's scopes. The
 * transport and sender dimensions are unrestricted when they have zero
 * configured entries:
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
async function handleSendEmailRequest(
  req: NextRequest,
  auth: SendAuthContext,
): Promise<NextResponse> {
  const parsed_data = await sendEmailRequestBodySchema.safeParseAsync(
    await req.json(),
  );
  if (!parsed_data.success) {
    console.error(
      "Failed to parse request body to send email from this @schemavaults/mail-server instance: ",
      parsed_data.error,
    );
    return badRequest("Failed to parse request body!");
  }
  const sendEmailOpts = parsed_data.data;
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
    return internalServerError("Mail transport configuration is invalid!");
  }
  const requestedTransport: string | undefined = sendEmailOpts.transport;
  if (requestedTransport !== undefined) {
    if (!isMailTransportKind(requestedTransport)) {
      return badRequest(
        `Unknown transport '${requestedTransport}'! Expected one of: ${MAIL_TRANSPORT_KINDS.join(", ")}.`,
      );
    }
    if (!transportAvailability.configured.includes(requestedTransport)) {
      return badRequest(
        `Transport '${requestedTransport}' is not configured on this server.`,
      );
    }
  }
  const transportId: MailTransportKind =
    requestedTransport !== undefined && isMailTransportKind(requestedTransport)
      ? requestedTransport
      : transportAvailability.defaultTransport;

  // Open a single ServerlessDatabase handle for the lifetime of any DB
  // work this request needs (scope lookup + mailing-list expansion).
  // If neither path runs we skip opening the handle entirely.
  let resolvedFromMailingListId: string | null = null;
  const needsDb: boolean = auth.apiKeyId !== null || toIsUuid;
  if (needsDb) {
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();

      // ---- Scope enforcement (API-key callers only) ----
      if (auth.apiKeyId !== null) {
        const keysRegistry = new MailKeysRegistry(dbh);
        const scopes = await keysRegistry.getApiKeyScopes(auth.apiKeyId);

        // Transport scope: the resolved transport (explicit or default)
        // must be allowlisted.
        if (
          scopes.allowedTransportIds.length > 0 &&
          !scopes.allowedTransportIds.includes(transportId)
        ) {
          return forbidden(
            `This API key is not permitted to use the '${transportId}' mail transport.`,
          );
        }

        // Sender scope: `from` (after default fallback) and `replyTo` must
        // both match the key's allowed sender entries.
        if (scopes.allowedSenders.length > 0) {
          const fromAddress = extractEmailAddress(from);
          if (!senderMatchesAllowlist(fromAddress, scopes.allowedSenders)) {
            return forbidden(
              `This API key is not permitted to send from '${fromAddress}'.`,
            );
          }
          if (sendEmailOpts.replyTo !== undefined) {
            const replyToAddress = extractEmailAddress(sendEmailOpts.replyTo);
            if (
              !senderMatchesAllowlist(replyToAddress, scopes.allowedSenders)
            ) {
              return forbidden(
                `This API key is not permitted to set '${replyToAddress}' as the reply-to address.`,
              );
            }
          }
        }

        // Audience scope: sending to any recipient requires the key's
        // explicit `allow_any_audience` flag. Without it, the mailing-list +
        // individual-recipient entries form one combined allowlist, and a key
        // with no entries may not send to anyone.
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
          return forbidden(audienceDecision.message);
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
          return badRequest("Mailing list has no active subscribers.");
        }
        if (recipients.length > MAX_RECIPIENTS_PER_SEND) {
          return badRequest(
            `Mailing list has more than ${MAX_RECIPIENTS_PER_SEND} active subscribers; per-send recipient limit exceeded.`,
          );
        }

        to = recipients;
        resolvedFromMailingListId = mailingListId;
      }
    } catch (e: unknown) {
      console.error(
        `Failed to prepare send (apiKeyId='${auth.apiKeyId ?? "none"}', to='${
          typeof sendEmailOpts.to === "string" ? sendEmailOpts.to : "<array>"
        }'): `,
        e,
      );
      return internalServerError("Failed to prepare email for sending!");
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
  };

  // Transports throw on delivery failure (see IMailTransport), so any
  // non-thrown return here means the send was accepted.
  try {
    if ("template_id" in sendEmailOpts.message) {
      const parsed_template_id = await emailTemplateIdSchema.safeParseAsync(
        sendEmailOpts.message.template_id,
      );
      if (!parsed_template_id.success) {
        return badRequest("Invalid template ID!");
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
      await sendEmail({
        ...baseEmailOpts,
        text: sendEmailOpts.message.text,
        html: sendEmailOpts.message.html,
      });
    }
  } catch (e: unknown) {
    if (e instanceof BadEmailTemplatePropsError) {
      console.error("Error sending email — invalid template props: ", e.message);
      return badRequest(e.message);
    }

    console.error("Error sending email: ", e);

    return internalServerError(
      typeof e === "object" &&
        !!e &&
        "message" in e &&
        typeof e.message === "string"
        ? e.message
        : "An unknown error has occurred while attempting to send email!",
    );
  }

  const authLogTag: string =
    auth.apiKeyId !== null ? ` [api_key=${auth.apiKeyId}]` : "";
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

  return emailSentSuccessfullyResponse();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // API-key path: if the caller is presenting a token that looks like a
  // SchemaVaults Mail Server API key, validate it against the api_keys table
  // and skip the admin JWT guard entirely. The validated record is passed
  // through so allowlist enforcement can scope what this key may send.
  if (requestLooksLikeApiKeyAuth(req)) {
    const result = await validateApiKeyFromRequest(req);
    if (!result.valid) {
      return unauthorized("Invalid or revoked API key.");
    }
    return await handleSendEmailRequest(req, {
      apiKeyId: result.record.api_key_id,
    });
  }

  // Fallback path: existing admin JWT guard. Keeps the in-app
  // /admin/send-email page working without changes. Admins bypass
  // allowlist enforcement entirely (apiKeyId = null).
  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req }): Promise<NextResponse> {
      return await handleSendEmailRequest(req, { apiKeyId: null });
    },
  );
  return await protected_route(req);
}
