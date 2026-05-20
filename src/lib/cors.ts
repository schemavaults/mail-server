import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import {
  SCHEMAVAULTS_MAIL_APP_DEVELOPMENT_DOMAIN,
  SCHEMAVAULTS_MAIL_APP_PRODUCTION_DOMAIN,
  SCHEMAVAULTS_MAIL_APP_STAGING_DOMAIN,
  SCHEMAVAULTS_MAIL_APP_TEST_DOMAIN,
  SCHEMAVAULTS_WEB_APP_DEVELOPMENT_DOMAIN,
  SCHEMAVAULTS_WEB_APP_PRODUCTION_DOMAIN,
  SCHEMAVAULTS_WEB_APP_STAGING_DOMAIN,
  SCHEMAVAULTS_WEB_APP_TEST_DOMAIN,
} from "@schemavaults/app-definitions";

const ALLOWED_ORIGINS: readonly string[] = [
  SCHEMAVAULTS_WEB_APP_PRODUCTION_DOMAIN.domain,
  SCHEMAVAULTS_WEB_APP_STAGING_DOMAIN.domain,
  SCHEMAVAULTS_WEB_APP_DEVELOPMENT_DOMAIN.domain,
  SCHEMAVAULTS_WEB_APP_TEST_DOMAIN.domain,
  SCHEMAVAULTS_MAIL_APP_PRODUCTION_DOMAIN.domain,
  SCHEMAVAULTS_MAIL_APP_STAGING_DOMAIN.domain,
  SCHEMAVAULTS_MAIL_APP_DEVELOPMENT_DOMAIN.domain,
  SCHEMAVAULTS_MAIL_APP_TEST_DOMAIN.domain,
];

function isAllowedOrigin(origin: string | null): origin is string {
  return typeof origin === "string" && ALLOWED_ORIGINS.includes(origin);
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
