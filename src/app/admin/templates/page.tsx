import "server-only";

import type { ReactElement } from "react";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";
import TemplatesBrowserClient from "./templates-browser-client";

export default async function TemplatesPage(): Promise<ReactElement> {
  return await withAdminServerComponentRouteGuard(
    async function TemplatesServerComponent(): Promise<ReactElement> {
      const templateIds = Object.keys(EmailTemplatesCatalog);
      return <TemplatesBrowserClient templateIds={templateIds} />;
    },
  );
}
