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
      const templateIds = Object.keys(EmailTemplatesCatalog);
      return <SendEmailFormClient templateIds={templateIds} />;
    },
  );
}
