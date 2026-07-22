import { getAppId } from "@/lib/getAppId";
import {
  withAdminApiRouteGuard as _withAdminApiRouteGuard,
  withAdminServerComponentRouteGuard as _withAdminServerComponentRouteGuard,
  type TProtectedAdminApiRoute,
  type IBaseProtectedAdminApiRouteInputs,
  type TProtectedAdminPageServerComponent,
  type IBaseProtectedAdminServerComponentPageProps,
  getAuthServerOwnerOrganizationId,
} from "@schemavaults/auth-server-sdk";
import { type NextRequest, NextResponse } from "next/server";
import { ServerlessDatabase } from "./ServerlessDatabase";
import type { ReactElement } from "react";

type THandler = (req: NextRequest) => Promise<NextResponse>;

interface IAdminApiRouteProps extends IBaseProtectedAdminApiRouteInputs {
  dbh: ServerlessDatabase;
}

export async function withAdminApiRouteGuard(
  api_route_handler: TProtectedAdminApiRoute<IAdminApiRouteProps>,
): Promise<THandler> {
  await using dbh: ServerlessDatabase = ServerlessDatabase.getAsyncResource();

  const protected_route: THandler =
    _withAdminApiRouteGuard<IAdminApiRouteProps>(
      api_route_handler,
      {
        dbh,
      },
      {
        route_guard_type: "admin",
        custom_is_authorized_check: async (opts) =>
          opts.user.admin ? true : false,
        api_server_id: getAppId(),
        required_organization: getAuthServerOwnerOrganizationId(),
      },
    );

  return protected_route satisfies THandler;
}

interface IAdminServerComponentProps extends IBaseProtectedAdminServerComponentPageProps {
  dbh: ServerlessDatabase;
}

export async function withAdminServerComponentRouteGuard(
  server_component: TProtectedAdminPageServerComponent<IAdminServerComponentProps>,
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
    },
  );
}
