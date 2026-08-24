import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import { apiKeyNameSchema } from "@/lib/api-keys/api-key-name";

const createApiKeyBodySchema = z.object({
  name: apiKeyNameSchema,
});

interface ListApiKeysSuccessResponse {
  success: true;
  data: readonly ApiKeyRecord[];
}

interface CreateApiKeySuccessResponse {
  success: true;
  data: {
    api_key_id: string;
    name: string;
    key_prefix: string;
    plaintext: string;
    created_at: number;
    created_by_user_id: string;
  };
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
        const registry = new MailKeysRegistry(dbh);
        const keys = await registry.listApiKeys({ includeRevoked: false });
        return NextResponse.json(
          {
            success: true,
            data: keys,
          } satisfies ListApiKeysSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to list API keys: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to list API keys!",
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
      let name: string;
      try {
        const body = await req.json();
        const parsed = createApiKeyBodySchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            {
              success: false,
              message: parsed.error.issues[0]?.message ?? "Invalid request body.",
            } satisfies ErrorResponse,
            { status: 400 },
          );
        }
        name = parsed.data.name;
      } catch (e: unknown) {
        console.error("Failed to parse create-api-key request body: ", e);
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
        const registry = new MailKeysRegistry(dbh);
        const created = await registry.createApiKey({
          name,
          created_by_user_id: user.uid,
        });
        return NextResponse.json(
          {
            success: true,
            data: created,
            message: `Successfully created API key '${created.name}'.`,
          } satisfies CreateApiKeySuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to create API key: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to create API key!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}
