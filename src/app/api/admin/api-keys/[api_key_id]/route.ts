import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import { apiKeyNameSchema } from "@/lib/api-keys/api-key-name";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";

const apiKeyIdSchema = z.string().uuid();

/**
 * PATCH body. `name` renames the key (its ID, secret and scopes are
 * untouched); `allow_any_audience` toggles the key's permission to send to
 * ANY recipient, which is off for every newly created key. At least one field
 * must be present, and both may be sent together.
 */
const updateApiKeyBodySchema = z
  .object({
    name: apiKeyNameSchema.optional(),
    allow_any_audience: z.boolean().optional(),
  })
  .refine(
    (body) => body.name !== undefined || body.allow_any_audience !== undefined,
    {
      message:
        "Nothing to update; expected 'name' and/or 'allow_any_audience'.",
    },
  );

interface SuccessResponse {
  success: true;
  message: string;
}

interface UpdateSuccessResponse {
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

      let name: string | undefined;
      let allow_any_audience: boolean | undefined;
      try {
        const body = await req.json();
        const parsedBody = updateApiKeyBodySchema.safeParse(body);
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
        allow_any_audience = parsedBody.data.allow_any_audience;
      } catch (e: unknown) {
        console.error("Failed to parse update-api-key request body: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to parse request body!",
          } satisfies ErrorResponse,
          { status: 400 },
        );
      }

      let updated: ApiKeyRecord | null = null;
      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        // Renaming only touches the NAME column, and the audience switch only
        // touches ALLOW_ANY_AUDIENCE — the key's ID, secret hash and scope
        // entries are untouched either way, so existing integrations keep
        // working.
        if (name !== undefined) {
          updated = await registry.renameApiKey(api_key_id, name);
        }
        // A null result from the rename above means there is no active key
        // with this ID, so skip the audience update and fall through to 404.
        const keyExists: boolean = name === undefined || updated !== null;
        if (allow_any_audience !== undefined && keyExists) {
          updated = await registry.setAllowAnyAudience(
            api_key_id,
            allow_any_audience,
          );
        }
      } catch (e: unknown) {
        console.error("Failed to update API key: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to update API key!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }

      if (!updated) {
        return NextResponse.json(
          {
            success: false,
            message: `No active API key found with ID: '${api_key_id}'.`,
          } satisfies ErrorResponse,
          { status: 404 },
        );
      }

      const changes: string[] = [];
      if (name !== undefined) changes.push(`renamed it to '${updated.name}'`);
      if (allow_any_audience !== undefined) {
        changes.push(
          allow_any_audience
            ? "allowed it to send to any recipient"
            : "restricted it to its allowlisted audience",
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: updated,
          message: `Successfully updated API key: ${changes.join(" and ")}.`,
        } satisfies UpdateSuccessResponse,
        { status: 200 },
      );
    },
  );
  return await protected_route(req);
}
