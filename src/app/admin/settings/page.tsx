import "server-only";

import type { ReactElement } from "react";
import { connection } from "next/server";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import {
  DeploymentSettingsRegistry,
  type DeploymentSettings,
} from "@/lib/mail-db";
import SettingsClientView from "./settings-client-view";

/**
 * Deployment-wide settings: currently the default time zone the admin
 * pages show times in and /admin/email-traffic groups traffic by.
 */
export default async function AdminSettingsPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminSettingsServerComponent({
      dbh,
    }): Promise<ReactElement> {
      let settings: DeploymentSettings | null = null;
      let loadError: string | null = null;
      try {
        settings = await new DeploymentSettingsRegistry(dbh).getSettings();
      } catch (e: unknown) {
        console.error("Failed to load the deployment settings: ", e);
        loadError = "Failed to load the deployment settings!";
      }

      return (
        <SettingsClientView initialSettings={settings} loadError={loadError} />
      );
    },
    { next_href: "/admin/settings" },
  );
}
