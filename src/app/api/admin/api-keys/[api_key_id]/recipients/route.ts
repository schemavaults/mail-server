import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";

const apiKeyIdSchema = z.string().uuid();
const recipientMutationBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

interface ListRecipientsSuccessResponse {
  success: true;
  data: string[];
}

interface MutateRecipientsSuccessResponse {
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
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]/recipients">,
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
        const data = await registry.listAllowedRecipientEmails(api_key_id);
        return NextResponse.json(
          { success: true, data } satisfies ListRecipientsSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to list API key allowed recipients: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to list API key allowed recipients!",
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
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]/recipients">,
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req }): Promise<NextResponse> {
      const parsedKeyId = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsedKeyId.success) {
        return badRequestJson("Invalid api_key_id; must be a valid UUID.");
      }
      const api_key_id = parsedKeyId.data;

      let email: string;
      try {
        const body = await req.json();
        const parsed = recipientMutationBodySchema.safeParse(body);
        if (!parsed.success) {
          return badRequestJson(
            parsed.error.issues[0]?.message ??
              "Invalid request body; expected { email }.",
          );
        }
        email = parsed.data.email;
      } catch (e: unknown) {
        console.error("Failed to parse add-recipient request body: ", e);
        return badRequestJson("Failed to parse request body!");
      }

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        await registry.addAllowedRecipientEmail(api_key_id, email);
        return NextResponse.json(
          {
            success: true,
            message: "Added recipient to API key audience allowlist.",
          } satisfies MutateRecipientsSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        if (isFkViolation(e)) {
          return badRequestJson("Unknown api_key_id (foreign key violation).");
        }
        console.error("Failed to add API key allowed recipient: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to add API key allowed recipient!",
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
  ctx: RouteContext<"/api/admin/api-keys/[api_key_id]/recipients">,
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function DELETE_handler({ req }): Promise<NextResponse> {
      const parsedKeyId = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsedKeyId.success) {
        return badRequestJson("Invalid api_key_id; must be a valid UUID.");
      }
      const api_key_id = parsedKeyId.data;

      let email: string;
      try {
        const body = await req.json();
        const parsed = recipientMutationBodySchema.safeParse(body);
        if (!parsed.success) {
          return badRequestJson(
            parsed.error.issues[0]?.message ??
              "Invalid request body; expected { email }.",
          );
        }
        email = parsed.data.email;
      } catch (e: unknown) {
        console.error("Failed to parse remove-recipient request body: ", e);
        return badRequestJson("Failed to parse request body!");
      }

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        await registry.removeAllowedRecipientEmail(api_key_id, email);
        return NextResponse.json(
          {
            success: true,
            message: "Removed recipient from API key audience allowlist.",
          } satisfies MutateRecipientsSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to remove API key allowed recipient: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to remove API key allowed recipient!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}
