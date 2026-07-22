import "server-only";

import type { ReactElement } from "react";
import { BrandingAssetsRegistry } from "@/lib/mail-db";
import type { BrandingAssetMetadata } from "@/lib/mail-db/branding-assets-table";
import { withAdminServerComponentRouteGuard } from "@/lib/withAdminRouteGuard";
import { connection } from "next/server";
import BrandingClientView from "./branding-client-view";

export default async function AdminBrandingPage(): Promise<ReactElement> {
  await connection();

  return await withAdminServerComponentRouteGuard(
    async function AdminBrandingServerComponent({
      dbh,
    }): Promise<ReactElement> {
      let assets: readonly BrandingAssetMetadata[] = [];
      try {
        const registry = new BrandingAssetsRegistry(dbh);
        assets = await registry.listAssetMetadata();
      } catch (e: unknown) {
        console.error(
          "Failed to preload branding assets for admin page: ",
          e,
        );
      }

      return <BrandingClientView initialAssets={assets} />;
    },
  );
}
