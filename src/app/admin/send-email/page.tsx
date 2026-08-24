import "server-only";

import type { ReactElement } from "react";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";
import { loadMailTransportsAvailability } from "@/lib/mail-transport";
import SendEmailFormClient, {
  type SendEmailTransportOption,
} from "./send-email-form-client";
import { connection } from "next/server";

export default async function SendEmailPage(): Promise<ReactElement> {
  await connection();
  return await withAdminServerComponentRouteGuard(
    async function SendEmailServerComponent(): Promise<ReactElement> {
      const templates = await Promise.all(
        Object.entries(EmailTemplatesCatalog).map(async ([id, load]) => {
          const Entry = await load();
          const instance = new Entry();
          return { id, description: instance.description };
        }),
      );

      // Configured transports for the form's transport picker. When the
      // availability can't be resolved (bad MAIL_TRANSPORT), render the form
      // without a picker rather than failing the whole page.
      let transports: SendEmailTransportOption[] = [];
      try {
        const availability = loadMailTransportsAvailability();
        transports = availability.configured.map((id) => ({
          id,
          is_default: availability.defaultTransport === id,
        }));
      } catch (e: unknown) {
        console.error("Failed to resolve mail transport availability: ", e);
      }

      return (
        <SendEmailFormClient templates={templates} transports={transports} />
      );
    },
  );
}
