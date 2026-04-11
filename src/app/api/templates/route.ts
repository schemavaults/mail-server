import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";
import {
  requestLooksLikeApiKeyAuth,
  validateApiKeyFromRequest,
} from "@/lib/api-keys/validateApiKeyFromRequest";

interface TemplateListItem {
  id: string;
  description: string;
}

interface ListTemplatesSuccessResponse {
  success: true;
  data: TemplateListItem[];
}

interface ErrorResponse {
  success: false;
  message: string;
}

async function loadTemplateList(): Promise<NextResponse> {
  try {
    const entries: TemplateListItem[] = await Promise.all(
      Object.values(EmailTemplatesCatalog).map(async (load) => {
        const EntryClass = await load();
        const entry = new EntryClass();
        return { id: entry.id, description: entry.description };
      }),
    );
    return NextResponse.json(
      { success: true, data: entries } satisfies ListTemplatesSuccessResponse,
      { status: 200 },
    );
  } catch (e: unknown) {
    console.error("Failed to list email templates: ", e);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to list email templates!",
      } satisfies ErrorResponse,
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // API-key path: if the caller is presenting a token that looks like a
  // SchemaVaults Mail Server API key, validate it against the api_keys table
  // and skip the admin JWT guard entirely. Mirrors POST /api/send.
  if (requestLooksLikeApiKeyAuth(req)) {
    const result = await validateApiKeyFromRequest(req);
    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or revoked API key.",
        } satisfies ErrorResponse,
        { status: 401 },
      );
    }
    return await loadTemplateList();
  }

  // Fallback path: existing admin JWT guard.
  const protected_route = await withAdminApiRouteGuard(
    async function GET_handler(): Promise<NextResponse> {
      return await loadTemplateList();
    },
  );
  return await protected_route(req);
}
