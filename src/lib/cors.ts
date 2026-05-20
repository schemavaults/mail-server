import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import {
  getAppEnvironment,
  getHardcodedClientWebAppDomain,
  SCHEMAVAULTS_MAIL_APP_DEFINITION,
  SCHEMAVAULTS_WEB,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";

function buildAllowedOrigins(
  environment: SchemaVaultsAppEnvironment,
): readonly string[] {
  return [
    getHardcodedClientWebAppDomain(SCHEMAVAULTS_WEB.app_id, environment),
    getHardcodedClientWebAppDomain(
      SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id,
      environment,
    ),
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
