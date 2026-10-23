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

interface IAdminServerComponentProps extends IBaseProtectedAdminServerComponentPageProps {
  dbh: ServerlessDatabase;
}

export interface IWithAdminServerComponentRouteGuardWrapperOpts {
  /**
   * Same-origin path of the admin page being protected (e.g.
   * `/admin/keys`). Forwarded to `/auth/login?next_href=...` when an
   * unauthenticated user is bounced to the login page, so the post-login
   * redirect can return them to where they were headed. Server components
   * cannot read the request URL, so each page supplies its own path; unsafe
   * values are dropped by the SDK (`sanitizeNextHref`).
   */
  next_href?: string;
}

export async function withAdminServerComponentRouteGuard(
  server_component: TProtectedAdminPageServerComponent<IAdminServerComponentProps>,
  wrapper_opts?: IWithAdminServerComponentRouteGuardWrapperOpts,
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
      next_href: wrapper_opts?.next_href,
      // A revoked session is sent to the login page.
      is_token_revoked: isMailServerTokenRevoked,
    },
  );
}
