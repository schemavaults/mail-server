import "server-only";

import type { ReactElement } from "react";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";
import SendEmailFormClient from "./send-email-form-client";
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
      return <SendEmailFormClient templates={templates} />;
    },
  );
}
