import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import { allowedSenderEntrySchema } from "@/lib/api-keys/sender-scope";

const apiKeyIdSchema = z.string().uuid();
const senderMutationBodySchema = z.object({
  sender: allowedSenderEntrySchema,
});

interface ListSendersSuccessResponse {
  success: true;
  data: string[];
}

interface MutateSendersSuccessResponse {
  success: true;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
}

function badRequestJson(message: string): NextResponse {
  return NextResponse.json(
    { success: false, message } satisfies ErrorResponse,
    { status: 400 },
  );
}

function isFkViolation(e: unknown): boolean {
  // Postgres FK violation = SQLSTATE 23503. The neon driver surfaces this
  // as an Error with `code` on the cause; check both shapes defensively.
  if (typeof e !== "object" || e === null) return false;
  const anyE = e as { code?: unknown; cause?: { code?: unknown } };
  if (anyE.code === "23503") return true;
  if (anyE.cause && anyE.cause.code === "23503") return true;
  return false;
}

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]/senders">,
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function GET_handler(): Promise<NextResponse> {
      const parsed = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsed.success) {
        return badRequestJson("Invalid api_key_id; must be a valid UUID.");
      }
      const api_key_id = parsed.data;

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        const data = await registry.listAllowedSenders(api_key_id);
        return NextResponse.json(
          { success: true, data } satisfies ListSendersSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to list API key allowed senders: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to list API key allowed senders!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]/senders">,
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req }): Promise<NextResponse> {
      const parsedKeyId = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsedKeyId.success) {
        return badRequestJson("Invalid api_key_id; must be a valid UUID.");
      }
      const api_key_id = parsedKeyId.data;

      let sender: string;
      try {
        const body = await req.json();
        const parsed = senderMutationBodySchema.safeParse(body);
        if (!parsed.success) {
          return badRequestJson(
            parsed.error.issues[0]?.message ??
              "Invalid request body; expected { sender }.",
          );
        }
        sender = parsed.data.sender;
      } catch (e: unknown) {
        console.error("Failed to parse add-sender request body: ", e);
        return badRequestJson("Failed to parse request body!");
      }

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        await registry.addAllowedSender(api_key_id, sender);
        return NextResponse.json(
          {
            success: true,
            message: "Added sender to API key allowed senders.",
          } satisfies MutateSendersSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        if (isFkViolation(e)) {
          return badRequestJson("Unknown api_key_id (foreign key violation).");
        }
        console.error("Failed to add API key allowed sender: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to add API key allowed sender!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]/senders">,
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function DELETE_handler({ req }): Promise<NextResponse> {
      const parsedKeyId = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsedKeyId.success) {
        return badRequestJson("Invalid api_key_id; must be a valid UUID.");
      }
      const api_key_id = parsedKeyId.data;

      let sender: string;
      try {
        const body = await req.json();
        const parsed = senderMutationBodySchema.safeParse(body);
        if (!parsed.success) {
          return badRequestJson(
            parsed.error.issues[0]?.message ??
              "Invalid request body; expected { sender }.",
          );
        }
        sender = parsed.data.sender;
      } catch (e: unknown) {
        console.error("Failed to parse remove-sender request body: ", e);
        return badRequestJson("Failed to parse request body!");
      }

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        await registry.removeAllowedSender(api_key_id, sender);
        return NextResponse.json(
          {
            success: true,
            message: "Removed sender from API key allowed senders.",
          } satisfies MutateSendersSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to remove API key allowed sender: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to remove API key allowed sender!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}
