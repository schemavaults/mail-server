import "server-only";

import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailTransportSettingsRegistry } from "@/lib/mail-db/MailTransportSettingsRegistry";
import { TestEmailsRegistry } from "@/lib/mail-db/TestEmailsRegistry";
import { TEST_DATABASE_MAIL_TRANSPORT } from "./loadMailTransportConfig";
import type {
  IMailTransport,
  IMailTransportSendOptions,
  IMailTransportSendResult,
} from "./types";

function toAddressArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Fake-send transport for E2E testing: instead of delivering anything, each
 * send is stored as a row in the TEST_EMAILS table and can be read back via
 * GET /api/test-emails[/:test_email_id]. No SMTP/Resend (or any network) is
 * involved, and no real recipient ever receives mail.
 *
 * Only constructed when TEST_DATABASE_MAIL_TRANSPORT_ENABLED opts the
 * deployment in (see loadMailTransportConfig). On top of that env opt-in,
 * send() re-checks the admin kill switch in MAIL_TRANSPORT_SETTINGS on every
 * call, so disabling the transport at /admin/transports stops ALL fake
 * sends immediately — including internal ones (e.g. double-opt-in
 * confirmation emails when this transport is the deployment default), not
 * just /api/send requests.
 */
export class TestDatabaseMailTransport implements IMailTransport {
  public readonly kind = TEST_DATABASE_MAIL_TRANSPORT;

  public async send(
    options: IMailTransportSendOptions,
  ): Promise<IMailTransportSendResult> {
    if (!options.html && !options.text) {
      throw new TypeError(
        "Expected at least one of 'html' or 'text' email body content to send!",
      );
    }

    await using dbh = ServerlessDatabase.getAsyncResource();

    const settings = new MailTransportSettingsRegistry(dbh);
    if (!(await settings.isTransportEnabled(this.kind))) {
      throw new Error(
        `The '${this.kind}' mail transport has been disabled by an administrator (see /admin/transports).`,
      );
    }

    const registry = new TestEmailsRegistry(dbh);
    const stored = await registry.recordEmail({
      from_address: options.from,
      to_addresses: toAddressArray(options.to),
      cc_addresses: toAddressArray(options.cc),
      bcc_addresses: toAddressArray(options.bcc),
      reply_to_addresses: toAddressArray(options.replyTo),
      subject: options.subject,
      html: options.html ?? null,
      text: options.text ?? null,
    });

    return { id: stored.test_email_id };
  }
}

export default TestDatabaseMailTransport;
