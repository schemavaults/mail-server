import "server-only";

import {
  type NextMiddleware,
  NextResponse,
  type NextRequest,
  NextFetchEvent,
} from "next/server";
import { SchemaVaultsServerMiddleware } from "@schemavaults/auth-server-sdk";
import {
  getAppEnvironment,
  SCHEMAVAULTS_MAIL_APP_DEFINITION,
  SCHEMAVAULTS_REGISTRY_SERVER,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import { defaultAuthMiddlewareRules } from "@schemavaults/auth";
import { getDebugState } from "@/lib/getDebugState";

const SchemaVaultsMiddleware: NextMiddleware = async (
  req: NextRequest,
  event: NextFetchEvent,
): Promise<NextResponse | Response> => {
  const environment: SchemaVaultsAppEnvironment = getAppEnvironment();
  const debug: boolean = getDebugState(environment);

  if (debug) {
    console.log(
      `[SchemaVaultsMiddleware] Running @schemavaults/mail-server middleware in environment "${environment}" for URL: "${req.url}"...`,
    );
  }

  if (!process.env.PRIVATE_JWT_DECRYPTION_SECRET) {
    console.error(
      "Missing environment variable 'PRIVATE_JWT_DECRYPTION_SECRET'; it is required for the middleware!",
    );
    return NextResponse.json(
      { message: "Error running middleware" },
      { status: 500 },
    );
  } else if (!process.env.PUBLIC_JWT_SIGNING_VERIFIER) {
    console.error(
      "Missing environment variable 'PUBLIC_JWT_SIGNING_VERIFIER'; it is required for the middleware!",
    );
    return NextResponse.json(
      { message: "Error running middleware" },
      { status: 500 },
    );
  }

  const api_server_id = SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id;
  if (!api_server_id || typeof api_server_id !== "string") {
    throw new Error("API Server Registry ID is not set");
  }

  try {
    const middleware = new SchemaVaultsServerMiddleware({
      api_server_id,
      auth_middleware_rules: {
        ...defaultAuthMiddlewareRules,
        public: [
          ...defaultAuthMiddlewareRules.public,
          ["api", "mailing-lists"],
          ["api", "mailing-lists", "join"],
        ],
      },
      environment,
      debug,
    });
    const middleware_result = await middleware.handle({
      req,
      event,
      next: () => NextResponse.next(),
      json: NextResponse.json,
      redirect: NextResponse.redirect,
      rewrite: NextResponse.rewrite,
    });

    return middleware_result;
  } catch (e: unknown) {
    console.error(
      "[@schemavaults/mail-server | middleware.ts] Error running middleware: ",
      e,
    );
    return NextResponse.json(
      { message: "Error running middleware" },
      { status: 500 },
    );
  }
};

export default SchemaVaultsMiddleware satisfies NextMiddleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.png (favicon file)
     * - manifest.json (manifest file)
     * - media (media files)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|manifest.json|media).*)",
  ],
};
