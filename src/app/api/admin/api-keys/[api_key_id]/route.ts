import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";

const apiKeyIdSchema = z.string().uuid();

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
  ctx: { params: Promise<{ api_key_id: string }> },
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function DELETE_handler(): Promise<NextResponse> {
      const parsed = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid api_key_id; must be a valid UUID.",
          } satisfies ErrorResponse,
          { status: 400 },
        );
      }
      const api_key_id = parsed.data;

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        await registry.revokeApiKey(api_key_id);
      } catch (e: unknown) {
        console.error("Failed to revoke API key: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to revoke API key!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `Successfully revoked API key with ID: '${api_key_id}'.`,
        } satisfies SuccessResponse,
        { status: 200 },
      );
    },
  );
  return await protected_route(req);
}
