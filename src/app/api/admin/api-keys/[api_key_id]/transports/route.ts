import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import { MAIL_TRANSPORT_KINDS } from "@/lib/mail-transport";

const apiKeyIdSchema = z.string().uuid();
const transportMutationBodySchema = z.object({
  transport_id: z.enum(MAIL_TRANSPORT_KINDS),
});

interface ListTransportsSuccessResponse {
  success: true;
  data: string[];
}

interface MutateTransportsSuccessResponse {
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
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]/transports">,
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
        const data = await registry.listAllowedTransportIds(api_key_id);
        return NextResponse.json(
          { success: true, data } satisfies ListTransportsSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to list API key allowed transports: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to list API key allowed transports!",
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
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]/transports">,
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req }): Promise<NextResponse> {
      const parsedKeyId = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsedKeyId.success) {
        return badRequestJson("Invalid api_key_id; must be a valid UUID.");
      }
      const api_key_id = parsedKeyId.data;

      let transport_id: string;
      try {
        const body = await req.json();
        const parsed = transportMutationBodySchema.safeParse(body);
        if (!parsed.success) {
          return badRequestJson(
            parsed.error.issues[0]?.message ??
              "Invalid request body; expected { transport_id }.",
          );
        }
        transport_id = parsed.data.transport_id;
      } catch (e: unknown) {
        console.error("Failed to parse add-transport request body: ", e);
        return badRequestJson("Failed to parse request body!");
      }

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        await registry.addAllowedTransport(api_key_id, transport_id);
        return NextResponse.json(
          {
            success: true,
            message: "Added transport to API key allowed transports.",
          } satisfies MutateTransportsSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        if (isFkViolation(e)) {
          return badRequestJson("Unknown api_key_id (foreign key violation).");
        }
        console.error("Failed to add API key allowed transport: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to add API key allowed transport!",
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
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]/transports">,
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function DELETE_handler({ req }): Promise<NextResponse> {
      const parsedKeyId = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsedKeyId.success) {
        return badRequestJson("Invalid api_key_id; must be a valid UUID.");
      }
      const api_key_id = parsedKeyId.data;

      let transport_id: string;
      try {
        const body = await req.json();
        const parsed = transportMutationBodySchema.safeParse(body);
        if (!parsed.success) {
          return badRequestJson(
            parsed.error.issues[0]?.message ??
              "Invalid request body; expected { transport_id }.",
          );
        }
        transport_id = parsed.data.transport_id;
      } catch (e: unknown) {
        console.error("Failed to parse remove-transport request body: ", e);
        return badRequestJson("Failed to parse request body!");
      }

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        await registry.removeAllowedTransport(api_key_id, transport_id);
        return NextResponse.json(
          {
            success: true,
            message: "Removed transport from API key allowed transports.",
          } satisfies MutateTransportsSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to remove API key allowed transport: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to remove API key allowed transport!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}
