import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import { apiKeyNameSchema } from "@/lib/api-keys/api-key-name";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";

const apiKeyIdSchema = z.string().uuid();
const renameApiKeyBodySchema = z.object({
  name: apiKeyNameSchema,
});

interface SuccessResponse {
  success: true;
  message: string;
}

interface RenameSuccessResponse {
  success: true;
  data: ApiKeyRecord;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
}

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]">,
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

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]">,
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function PATCH_handler({ req }): Promise<NextResponse> {
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

      let name: string;
      try {
        const body = await req.json();
        const parsedBody = renameApiKeyBodySchema.safeParse(body);
        if (!parsedBody.success) {
          return NextResponse.json(
            {
              success: false,
              message:
                parsedBody.error.issues[0]?.message ?? "Invalid request body.",
            } satisfies ErrorResponse,
            { status: 400 },
          );
        }
        name = parsedBody.data.name;
      } catch (e: unknown) {
        console.error("Failed to parse rename-api-key request body: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to parse request body!",
          } satisfies ErrorResponse,
          { status: 400 },
        );
      }

      let renamed: ApiKeyRecord | null;
      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        // Renaming only touches the NAME column — the key's ID, secret hash
        // and scope entries are untouched, so existing integrations keep
        // working.
        renamed = await registry.renameApiKey(api_key_id, name);
      } catch (e: unknown) {
        console.error("Failed to rename API key: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to rename API key!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }

      if (!renamed) {
        return NextResponse.json(
          {
            success: false,
            message: `No active API key found with ID: '${api_key_id}'.`,
          } satisfies ErrorResponse,
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: renamed,
          message: `Successfully renamed API key to '${renamed.name}'.`,
        } satisfies RenameSuccessResponse,
        { status: 200 },
      );
    },
  );
  return await protected_route(req);
}
