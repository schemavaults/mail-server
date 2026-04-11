import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";

const apiKeyIdSchema = z.string().uuid();
const allowlistMutationBodySchema = z.object({
  mailing_list_id: z.string().uuid(),
});

interface ListAllowlistSuccessResponse {
  success: true;
  data: string[];
}

interface MutateAllowlistSuccessResponse {
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
  ctx: { params: Promise<{ api_key_id: string }> },
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
        const data = await registry.listAllowedMailingListIds(api_key_id);
        return NextResponse.json(
          { success: true, data } satisfies ListAllowlistSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to list API key allowlist: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to list API key allowlist!",
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
  ctx: { params: Promise<{ api_key_id: string }> },
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req }): Promise<NextResponse> {
      const parsedKeyId = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsedKeyId.success) {
        return badRequestJson("Invalid api_key_id; must be a valid UUID.");
      }
      const api_key_id = parsedKeyId.data;

      let mailing_list_id: string;
      try {
        const body = await req.json();
        const parsed = allowlistMutationBodySchema.safeParse(body);
        if (!parsed.success) {
          return badRequestJson(
            parsed.error.issues[0]?.message ??
              "Invalid request body; expected { mailing_list_id }.",
          );
        }
        mailing_list_id = parsed.data.mailing_list_id;
      } catch (e: unknown) {
        console.error("Failed to parse add-allowlist request body: ", e);
        return badRequestJson("Failed to parse request body!");
      }

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        await registry.addAllowedMailingList(api_key_id, mailing_list_id);
        return NextResponse.json(
          {
            success: true,
            message: "Added mailing list to API key allowlist.",
          } satisfies MutateAllowlistSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        if (isFkViolation(e)) {
          return badRequestJson(
            "Unknown api_key_id or mailing_list_id (foreign key violation).",
          );
        }
        console.error("Failed to add API key allowlist entry: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to add API key allowlist entry!",
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
  ctx: { params: Promise<{ api_key_id: string }> },
): Promise<NextResponse> {
  const { api_key_id: rawApiKeyId } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function DELETE_handler({ req }): Promise<NextResponse> {
      const parsedKeyId = apiKeyIdSchema.safeParse(rawApiKeyId);
      if (!parsedKeyId.success) {
        return badRequestJson("Invalid api_key_id; must be a valid UUID.");
      }
      const api_key_id = parsedKeyId.data;

      let mailing_list_id: string;
      try {
        const body = await req.json();
        const parsed = allowlistMutationBodySchema.safeParse(body);
        if (!parsed.success) {
          return badRequestJson(
            parsed.error.issues[0]?.message ??
              "Invalid request body; expected { mailing_list_id }.",
          );
        }
        mailing_list_id = parsed.data.mailing_list_id;
      } catch (e: unknown) {
        console.error("Failed to parse remove-allowlist request body: ", e);
        return badRequestJson("Failed to parse request body!");
      }

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new MailKeysRegistry(dbh);
        await registry.removeAllowedMailingList(api_key_id, mailing_list_id);
        return NextResponse.json(
          {
            success: true,
            message: "Removed mailing list from API key allowlist.",
          } satisfies MutateAllowlistSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to remove API key allowlist entry: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to remove API key allowlist entry!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}
