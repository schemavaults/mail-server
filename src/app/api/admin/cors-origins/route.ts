import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { CorsOriginsRegistry } from "@/lib/mail-db/CorsOriginsRegistry";
import {
  corsOriginValueSchema,
  type CorsAllowedOrigin,
} from "@/lib/mail-db/cors-allowed-origins-table";

const addCorsOriginBodySchema = z.object({
  origin: corsOriginValueSchema,
  description: z
    .string()
    .max(255, "Description must be 255 characters or fewer.")
    .optional(),
});

interface ListCorsOriginsSuccessResponse {
  success: true;
  data: readonly CorsAllowedOrigin[];
}

interface AddCorsOriginSuccessResponse {
  success: true;
  data: CorsAllowedOrigin;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function GET_handler({ req: _req }): Promise<NextResponse> {
      void _req;
      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new CorsOriginsRegistry(dbh);
        const origins = await registry.listOrigins();
        return NextResponse.json(
          {
            success: true,
            data: origins,
          } satisfies ListCorsOriginsSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to list allowed CORS origins: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to list allowed CORS origins!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req, user }): Promise<NextResponse> {
      let origin: string;
      let description: string | undefined;
      try {
        const body = await req.json();
        const parsed = addCorsOriginBodySchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            {
              success: false,
              message:
                parsed.error.issues[0]?.message ?? "Invalid request body.",
            } satisfies ErrorResponse,
            { status: 400 },
          );
        }
        origin = parsed.data.origin;
        description = parsed.data.description;
      } catch (e: unknown) {
        console.error("Failed to parse add-cors-origin request body: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to parse request body!",
          } satisfies ErrorResponse,
          { status: 400 },
        );
      }

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new CorsOriginsRegistry(dbh);
        if (await registry.isAllowedOrigin(origin)) {
          return NextResponse.json(
            {
              success: false,
              message: `Origin '${origin}' is already allowed.`,
            } satisfies ErrorResponse,
            { status: 409 },
          );
        }
        const created = await registry.addOrigin({
          origin,
          description,
          created_by_user_id: user.uid,
        });
        return NextResponse.json(
          {
            success: true,
            data: created,
            message: `Successfully allowed CORS origin '${created.origin}'.`,
          } satisfies AddCorsOriginSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to add allowed CORS origin: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to add allowed CORS origin!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}
