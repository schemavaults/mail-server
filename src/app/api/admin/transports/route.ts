import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import {
  loadMailTransportsAvailability,
  MAIL_TRANSPORT_KINDS,
  type MailTransportKind,
} from "@/lib/mail-transport";

/**
 * One transport this mail-server knows about. `configured` reflects whether
 * the transport's env vars are present on this deployment; `is_default`
 * marks the transport MAIL_TRANSPORT selects when a send request omits its
 * `transport` property. Credentials are never included.
 */
export interface TransportStatus {
  id: MailTransportKind;
  configured: boolean;
  is_default: boolean;
}

interface ListTransportsSuccessResponse {
  success: true;
  data: TransportStatus[];
}

interface ErrorResponse {
  success: false;
  message: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function GET_handler(): Promise<NextResponse> {
      try {
        const availability = loadMailTransportsAvailability();
        const data: TransportStatus[] = MAIL_TRANSPORT_KINDS.map((id) => ({
          id,
          configured: availability.configured.includes(id),
          is_default: availability.defaultTransport === id,
        }));
        return NextResponse.json(
          { success: true, data } satisfies ListTransportsSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error("Failed to resolve mail transport availability: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to resolve mail transport availability!",
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}
