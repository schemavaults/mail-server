import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import {
  getAppEnvironment,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import {
  getClientWebAppDomain,
  SCHEMAVAULTS_MAIL_APP_ID,
  SCHEMAVAULTS_WEB_APP_ID,
} from "@/lib/schemavaults-apps";

function buildAllowedOrigins(
  environment: SchemaVaultsAppEnvironment,
): readonly string[] {
  return [
    getClientWebAppDomain(SCHEMAVAULTS_WEB_APP_ID, environment),
    getClientWebAppDomain(SCHEMAVAULTS_MAIL_APP_ID, environment),
  ];
}

function isAllowedOrigin(origin: string | null): origin is string {
  if (typeof origin !== "string") return false;
  return buildAllowedOrigins(getAppEnvironment()).includes(origin);
}

export function applyCorsHeaders(
  req: NextRequest,
  res: NextResponse,
): NextResponse {
  const origin = req.headers.get("origin");
  if (isAllowedOrigin(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.append("Vary", "Origin");
  }
  return res;
}

export function corsPreflightResponse(req: NextRequest): NextResponse {
  const origin = req.headers.get("origin");
  const headers = new Headers();
  if (isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    const requestedHeaders = req.headers.get(
      "access-control-request-headers",
    );
    headers.set(
      "Access-Control-Allow-Headers",
      requestedHeaders ?? "Content-Type, Authorization",
    );
    headers.set("Access-Control-Max-Age", "86400");
  }
  return new NextResponse(null, { status: 204, headers });
}
