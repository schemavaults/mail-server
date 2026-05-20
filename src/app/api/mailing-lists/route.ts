import "server-only";

import type { NextRequest, NextResponse } from "next/server";
import { corsPreflightResponse } from "@/lib/cors";

export { POST } from "./createMailingListPOSThandler";
export { GET } from "./listMailingListsGEThandler";

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return corsPreflightResponse(req);
}
