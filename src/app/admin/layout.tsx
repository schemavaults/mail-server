import "server-only";

import type { ReactElement, ReactNode } from "react";
import { connection } from "next/server";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { DeploymentSettingsRegistry } from "@/lib/mail-db";
import { DeploymentTimeZoneProvider } from "@/contexts/DeploymentTimeZoneContext";

/**
 * Wraps every admin page in the deployment's default time zone (set at
 * /admin/settings), so their client components show times in it. Each
 * page still runs its own admin guard; the time zone is not sensitive, and
 * a failed lookup falls back to each viewer's browser time zone.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  await connection();

  let timeZone: string | null = null;
  try {
    await using dbh = ServerlessDatabase.getAsyncResource();
    timeZone = (await new DeploymentSettingsRegistry(dbh).getSettings())
      .default_time_zone;
  } catch (e: unknown) {
    console.error("Failed to load the deployment's default time zone: ", e);
  }

  return (
    <DeploymentTimeZoneProvider timeZone={timeZone}>
      {children}
    </DeploymentTimeZoneProvider>
  );
}
