import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { CorsOriginsRegistry } from "@/lib/mail-db/CorsOriginsRegistry";

const corsOriginIdSchema = z.string().uuid();

interface SuccessResponse {
  success: true;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ cors_origin_id: string }> },
): Promise<NextResponse> {
  const { cors_origin_id: rawCorsOriginId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function DELETE_handler(): Promise<NextResponse> {
      const parsed = corsOriginIdSchema.safeParse(rawCorsOriginId);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid cors_origin_id; must be a valid UUID.",
          } satisfies ErrorResponse,
          { status: 400 },
        );
      }
      const cors_origin_id = parsed.data;

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new CorsOriginsRegistry(dbh);
        await registry.removeOrigin(cors_origin_id);
      } catch (e: unknown) {
        console.error("Failed to remove allowed CORS origin: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to remove allowed CORS origin!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `Successfully removed allowed CORS origin with ID: '${cors_origin_id}'.`,
        } satisfies SuccessResponse,
        { status: 200 },
      );
    },
  );
  return await protected_route(req);
}
