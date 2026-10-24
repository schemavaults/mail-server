import { getAppId } from "@/lib/getAppId";
import {
  withAdminServerComponentRouteGuard as _withAdminServerComponentRouteGuard,
  type TProtectedAdminPageServerComponent,
  type IBaseProtectedAdminServerComponentPageProps,
  getAuthServerOwnerOrganizationId,
} from "@schemavaults/auth-server-sdk";
import { ServerlessDatabase } from "./ServerlessDatabase";
import type { ReactElement } from "react";
import { isMailServerTokenRevoked } from "@/lib/api/token-revocation";

// API routes authenticate through the operations runtime (src/lib/api); this
// guard protects the admin pages, which render data server-side.

export interface IAdminServerComponentProps extends IBaseProtectedAdminServerComponentPageProps {
  dbh: ServerlessDatabase;
}

export interface IWithAdminServerComponentRouteGuardOptions {
  /**
   * Same-origin path of the page being protected (e.g. `/admin/keys`). A
   * signed-out visitor is sent to `/auth/login?next_href=<path>`, and the
   * sign-in flow returns them to it. Server components cannot read the
   * request URL, so each page names its own path.
   */
  next_href: string;
}

export async function withAdminServerComponentRouteGuard(
  server_component: TProtectedAdminPageServerComponent<IAdminServerComponentProps>,
  { next_href }: IWithAdminServerComponentRouteGuardOptions,
): Promise<ReactElement> {
  await using dbh: ServerlessDatabase = ServerlessDatabase.getAsyncResource();

  return await _withAdminServerComponentRouteGuard<IAdminServerComponentProps>(
    server_component,
    {
      dbh,
    },
    {
      route_guard_type: "admin",
      custom_is_authorized_check: async (opts) =>
        opts.user.admin ? true : false,
      api_server_id: getAppId(),
      required_organization: getAuthServerOwnerOrganizationId(),
      // A revoked session is sent to the login page.
      is_token_revoked: isMailServerTokenRevoked,
      next_href,
    },
  );
}
