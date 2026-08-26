// Shared plumbing for the E2E tests: environment resolution and small typed
// wrappers around the mail-server HTTP API. See e2e/README.md.

import { expect } from "bun:test";

/** Transport id under test — matches TEST_DATABASE_MAIL_TRANSPORT. */
export const TEST_TRANSPORT_ID = "test-database-transport";

const rawBaseUrl = process.env.E2E_MAIL_SERVER_BASE_URL ?? "";
/** Base URL of the running mail-server, without a trailing slash. */
export const BASE_URL: string = rawBaseUrl.replace(/\/+$/, "");

/** Plaintext API key seeded by e2e/setup/seed-e2e-api-key.ts. */
export const API_KEY: string = process.env.E2E_MAIL_SERVER_API_KEY ?? "";

/** The E2E suite runs only when a target server and API key are provided. */
export const E2E_ENABLED: boolean = BASE_URL.length > 0 && API_KEY.length > 0;

/**
 * Set E2E_DEFAULT_TRANSPORT_IS_TEST_DATABASE=true when the server under
 * test uses MAIL_TRANSPORT=test-database-transport (as CI does), enabling
 * the default-transport test. Without it that test is skipped so a send
 * with no `transport` can never reach a real delivery transport.
 */
export const DEFAULT_TRANSPORT_IS_TEST_DATABASE: boolean =
  process.env.E2E_DEFAULT_TRANSPORT_IS_TEST_DATABASE === "true";

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  /** Overrides the seeded API key (e.g. to test rejection). */
  bearerToken?: string;
}

export async function apiRequest(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.bearerToken ?? API_KEY}`,
  };
  let body: string | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  return await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body,
  });
}

/** Matches the /api/send request body (see SendEmailRequestBody). */
export interface SendEmailRequest {
  to: string | string[];
  from?: string;
  subject: string;
  message:
    | { html: string; text: string }
    | { template_id: string; template_props?: unknown };
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  dryRun?: boolean;
  transport?: string;
}

export async function sendEmail(request: SendEmailRequest): Promise<Response> {
  return await apiRequest("/api/send", { body: request });
}

/** Matches the TestEmail schema served by /api/test-emails. */
export interface TestEmailRecord {
  test_email_id: string;
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[];
  bcc_addresses: string[];
  reply_to_addresses: string[];
  subject: string;
  html: string | null;
  text: string | null;
  created_at: number;
}

async function parseDataEnvelope<TData>(response: Response): Promise<TData> {
  expect(response.status).toBe(200);
  const body = (await response.json()) as {
    success: boolean;
    data: TData;
  };
  expect(body.success).toBe(true);
  return body.data;
}

export async function listTestEmails(
  params: { limit?: number; offset?: number } = {},
): Promise<TestEmailRecord[]> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const response = await apiRequest(`/api/test-emails${suffix}`);
  return await parseDataEnvelope<TestEmailRecord[]>(response);
}

export async function getTestEmail(
  test_email_id: string,
): Promise<TestEmailRecord> {
  const response = await apiRequest(`/api/test-emails/${test_email_id}`);
  return await parseDataEnvelope<TestEmailRecord>(response);
}

/**
 * Polls the list endpoint for an email with the given subject. Storage is
 * synchronous with the send request, so the retries only paper over
 * transient timing (e.g. clock granularity in ordering), not real queues.
 */
export async function findTestEmailBySubject(
  subject: string,
  options: { attempts?: number } = {},
): Promise<TestEmailRecord | null> {
  const attempts = options.attempts ?? 5;
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const emails = await listTestEmails({ limit: 50 });
    const match = emails.find((email) => email.subject === subject);
    if (match !== undefined) return match;
  }
  return null;
}

/** A unique, greppable subject line for one test case. */
export function uniqueSubject(label: string): string {
  return `[e2e:${label}] ${crypto.randomUUID()}`;
}
