# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands use **Bun** as the package manager and runtime.

```bash
bun install                    # Install dependencies
bun run dev:app                # Next.js dev server on port 5346 (runs auth-codegen first)
bun run dev:mail               # Email template dev server on port 5347 (react-email preview)
bun run build                  # Production build (runs auth-codegen first)
bun run typecheck              # Compile types
bun run auth-codegen           # Generate auth routes/components from @schemavaults/auth-server-sdk
bun run build:migrations       # Compile TypeScript migrations to JS in dist/migrations/
bun run migrate:development    # Build & run migrations against development DB (.env.development)
bun run migrate:test           # Build & run migrations against test DB (.env.test)
bun run migrate:production     # Build & run migrations against production DB (.env.production)
```

## Architecture

This is a **Next.js 16 App Router** mail server application in the SchemaVaults ecosystem. It manages mailing lists and sends transactional emails.

### Core Stack
- **Resend / SMTP (nodemailer)** — configurable outbound mail transports
- **react-email** — email templates as React components
- **Kysely + Neon PostgreSQL** — type-safe query builder over serverless Postgres
- **@schemavaults/openapi-operations** — every API operation is defined once (method, path, zod v4 request/response schemas, auth) with `defineOperation`; the same definitions generate the OpenAPI document and are served as per-route Hono apps with request validation and auth enforcement built in (see Key Patterns)
- **@schemavaults/openapi-docs-ui** — renders the generated OpenAPI document as the `/docs` API reference
- **@schemavaults/auth-server-sdk** — JWT-based authentication with admin role guards

### API Routes (`src/app/api/`)
- `POST /api/send` — send emails (admin JWT or API key; supports react-email templates or raw HTML/text; optional `transport` property selects a configured transport; optional base64 `attachments`, delivered by every transport)
- `GET /api/mailing-lists` — list mailing lists (public)
- `POST /api/mailing-lists` — create mailing list (admin only)
- `POST /api/mailing-lists/join` — subscribe to a mailing list
- `POST /api/mailing-lists/unsubscribe` — unsubscribe from a mailing list
- `POST /api/admin/init-db-tables` — initialize database schema (admin only)
- `GET /api/branding/[asset_kind]` — serve the uploaded logo/favicon (public; falls back to bundled defaults in `public/media/`)
- `PUT|DELETE /api/admin/branding/[asset_kind]` — upload/remove a custom logo or favicon (admin only; managed at `/admin/branding`)
- `GET /api/admin/transports` — list mail transports with configured/default/enabled status (admin only; shown at `/admin/transports`)
- `PATCH /api/admin/transports/[transport_id]` — enable/disable a transport's runtime kill switch (admin only; only the `test-database-transport` supports this, toggled at `/admin/transports`)
- `GET /api/test-emails` and `GET /api/test-emails/[test_email_id]` — list/read emails captured by the fake-send `test-database-transport` (admin JWT, or an API key whose transport scope permits the test-database transport; used by the E2E tests). The list returns attachment metadata only; read one email by ID for attachment content
- `GET|POST /api/admin/api-keys` — list/create API keys (admin only; the plaintext token is returned exactly once on create)
- `PATCH|DELETE /api/admin/api-keys/[api_key_id]` — update (`name` renames the label; `allow_any_audience` toggles the key's permission to send to any recipient — the key ID, secret and scope entries are unchanged either way) or revoke an API key (admin only)
- `GET|POST|DELETE /api/admin/api-keys/[api_key_id]/allowlist|senders|recipients|transports` — manage one API key's scope entries (admin only; managed at `/admin/keys`)
- `GET /api/openapi.json` — the generated OpenAPI 3.1 document (public)
- `GET /docs` and `GET /docs/[slug]` — self-hosted API reference: an index of every operation plus one page per operation (public; server-rendered from the same OpenAPI document, no external CDN)

### Key Patterns
- **Operations, one route file per path**: every API route folder keeps an `operations.ts` exporting its `defineOperation(...)` definitions (from `@/lib/api/define-operation`: method, OpenAPI-style path with `{param}` placeholders, `request.params/query/body` zod schemas, `responses`, `auth`, and the `handler`) beside a thin `route.ts` — `export const { GET, POST } = serveOperations({ GET: listX, POST: createX })` from `@/lib/api/app` (keyed by method so exports and operations can't drift; `{ cors: true }` applies the CORS allowlist and adds OPTIONS). There is deliberately NO catch-all `/api/[[...route]]` app. The runtime (`createOperationsAppFactory`) resolves auth, validates params/query/body BEFORE the handler (400 `validation_error` with `issues`; 415 for a wrong body media type — JSON bodies set `lenientContentType: true` so unlabelled browser `fetch` bodies still parse), and answers every error with the `{ success: false, error, message }` OperationError envelope. Handlers get typed `ctx.params/query/body/auth`, respond with `ctx.json(status, body)` (type-checked against the declared `responses`) or a raw `Response`, and fail with `throw badRequest(...)`/`notFound(...)`/... from `@/lib/api/errors`. Every operation must also be listed in the catalogue `src/lib/api/operations.ts`; `src/lib/api/__tests__/routes.test.ts` (`checkNextAppRouterRoutes`) fails when operation files, route files and the catalogue disagree, and `document.test.ts` pins the expected paths. The four API-key scope routes share one factory (`scope-operations.ts` under the `[api_key_id]` folder). Shared building blocks live in `src/lib/api/`: response envelopes + `errorResponses()` (`responses.ts`), `uuidParam()`, tags, auth schemes/resolvers
- **Auth**: `src/lib/api/auth-schemes.ts` declares the accepted credentials — the SchemaVaults access token (bearer or first-party cookie; verified by `createSchemaVaultsAuthResolvers()` from `@schemavaults/auth-server-sdk/openapi-operations`) and the mail-server API key (`svlts_mail_pk_...` bearer, verified against API_KEYS). `adminAuth()` is for admin-only operations; `apiKeyOrAdminAuth(notes)` for `/api/send`, `/api/templates` and `/api/test-emails*`, whose handlers learn the key via `apiKeyIdOf(ctx.auth)` (null for admins, who bypass all scopes). Every operation accepting an access token is admin-only: the resolvers in `auth-resolvers.ts` refuse non-admin users with 403. Server components still use `withAdminServerComponentRouteGuard` (checks `user.admin`). **Token revocation**: every access token that verifies is also checked with the auth server through the SDK's revocation hook — `isMailServerTokenRevoked` (`src/lib/api/token-revocation.ts`) introspects the presented token (RFC 7662, `introspectToken()` with the JWKS access key) and requires it to come back active as the same `jti`/user. It is wired into the operations' resolvers (revoked → 401 `token_revoked`), the admin server-component guard (revoked → login redirect) and the optional admin check of `GET /api/mailing-lists`; an unreachable auth server fails closed. Costs one auth-server round trip per access-token request (API-key requests are unaffected)
- **OpenAPI document**: `src/lib/api/document.ts` builds `/api/openapi.json` from the catalogue with `buildOpenApiDocument()` (branding and server URL from env; cached per process), including the responses the runtime itself produces (`documentRuntimeResponses`). Schemas gain `.openapi()` metadata by importing `z` (or `withOpenApi` for schemas built by other packages) from `@/lib/zod-openapi`, which re-exports the package's zod entry point — client-safe, so shared validation schemas can use it
- **Docs UI**: `/docs` (index) and `/docs/[slug]` (one page per operation, slug = method + path, e.g. `post-api-send`) are server component pages from `createApiDocsPages()` of `@schemavaults/openapi-docs-ui/nextjs` (`src/app/docs/api-docs.tsx`), rendered from the in-process document inside `PublicPageShell`. Fully self-hosted — no external CDN assets; the package's `dist/` is in the Tailwind `content`
- **`/api/send` body schema**: `@schemavaults/send-email` builds its request body schema with this app's zod v4, so `/api/send` validates with the package's own `createSendEmailRequestBodySchema(true)`; `src/app/api/send/send-email-request-body-schema.ts` only attaches documentation (`withOpenApi`) to copies of its fields (wrap a field, don't rebuild it — rebuilding `attachments` would drop the package's count/size refinements)
- **Mail transports**: `src/lib/mail-transport/` defines the `IMailTransport` interface with three implementations — Resend API, raw SMTP via nodemailer, and the fake-send `test-database-transport` (stores each email as a TEST_EMAILS row instead of delivering; built for E2E tests). Multiple transports can be configured at once: a transport is *available* when its env vars are set (`RESEND_API_KEY` → `resend`, `SMTP_HOST` → `smtp`, `TEST_DATABASE_MAIL_TRANSPORT_ENABLED` → `test-database-transport`; see `loadMailTransportsAvailability()`), and the `MAIL_TRANSPORT` env var selects the *default* transport (`resend` when unset) used when a send request omits its `transport` property. All sends go through `sendEmail()` / `sendEmailFromTemplate()` in `src/lib/`, which resolve the transport lazily at send time (`loadMailTransport(env, transportId?)`); transports receive only rendered `html`/`text` (react-email templates are rendered via `@react-email/render` before the transport is involved) and throw on delivery failure. No fallback between transports. **Attachments** arrive in `IMailTransportSendOptions.attachments` in the package's `EmailAttachment` wire shape (base64 `content`, optional `contentType`/`contentId`; ≤20 files, ≤25 MiB decoded, enforced by the request schema): Resend gets the base64 strings as-is, SMTP maps them to nodemailer attachments (a `contentId` makes the part inline; nodemailer file/URL access is disabled), and the test-database transport stores them in TEST_EMAIL_ATTACHMENTS (same transaction as the TEST_EMAILS row). A missing `contentType` is derived from the filename by Resend/nodemailer; the test-database transport records it as given (null) On top of its env opt-in, the test-database transport has an admin-managed runtime kill switch (MAIL_TRANSPORT_SETTINGS row, toggled at `/admin/transports` via `PATCH /api/admin/transports/[transport_id]`) enforced both by `/api/send` (400) and inside `TestDatabaseMailTransport.send()`, so it can be shut off in production without a redeploy
- **E2E tests**: `e2e/` holds bun tests that exercise the full `/api/send` flow against a RUNNING server through the `test-database-transport` (send → read back via `/api/test-emails`). They skip themselves unless `E2E_MAIL_SERVER_BASE_URL` is set (so plain `bun test` stays unit-only); `bun run test:e2e` runs them. CI's `e2e` job stands up Postgres + a Neon websocket proxy, migrates, seeds an API key (`e2e/setup/seed-e2e-api-key.ts`), builds and starts the app with the test-database transport as default, then runs them
- **API key scoping**: `/api/send` calls authenticated with an API key are checked against three independent per-key scope dimensions: **audience** (see below), **senders** (API_KEY_ALLOWED_SENDERS entries are exact emails or `*@domain` wildcards; `from` — after falling back to the default sender — and `replyTo` must match; matching helpers live in `src/lib/api-keys/sender-scope.ts`), and **transports** (API_KEY_ALLOWED_TRANSPORTS; the resolved transport, explicit or default, must be allowed). Senders and transports are unrestricted when they have zero entries. Admin JWT callers bypass all scopes. Scopes are managed per key at `/admin/keys`
- **API key audience scoping**: sending to *any* recipient is opt-in per key, never implicit. `API_KEYS.allow_any_audience` (added in migration 00011) lifts the audience restriction entirely; without it, API_KEY_MAILING_LIST_ALLOWLISTS + API_KEY_RECIPIENT_ALLOWLISTS form ONE combined allowlist — the key may only pass a single allowlisted mailing-list UUID in `to`, or individual addresses that are all allowlisted, and may only cc/bcc allowlisted individuals — and a key with no entries at all may not send to anyone. New keys are created with `allow_any_audience = false` and no entries, so they can send to nobody until an admin configures their audience at `/admin/keys`. Migration 00011 grandfathered pre-existing keys that had no allowlist entries (previously unrestricted) to `allow_any_audience = true`. The decision logic is a pure helper in `src/lib/api-keys/audience-scope.ts` (`evaluateAudienceScope`), used by `/api/send`
- **Email template catalog**: `src/email-templates/catalog.ts` exports a registry mapping template names to React components; the `/api/send` route resolves templates by name and renders them with provided props
- **Database migrations**: Migration files live in `src/lib/mail-db/migrations/` as TypeScript, numbered sequentially (`00000-`, `00001-`, …). Each exports `up`/`down` functions taking a `Kysely<any>` instance. Raw SQL uses the `sql` tag re-exported from `src/lib/mail-db/sql.ts`. Migrations are compiled via `@schemavaults/dbh` to `dist/migrations/` before running. Per-environment env files (`.env.development`, `.env.test`, `.env.production`) provide DB credentials
- **Auth codegen**: Auth routes under `src/app/auth/` are auto-generated and gitignored; always run `bun run auth-codegen` (or use `dev:app`/`build` which do it automatically)
- **White-label branding**: All brand identity (name, URLs, support email, colors, footer links, mail sender) is configured via `BRAND_*` / `MAIL_FROM_*` environment variables (see `.env.example`). `src/email-templates/brand.ts` exports `getEmailBrand()` used by every email template as the fallback for brand-related props — never hardcode a brand name in template copy. `src/lib/branding.ts` exposes the fuller `getBrandConfig()` threaded to client components via `BrandingContext` (use the `useBranding()` hook, or `<BrandWordmark />` for the gradient wordmark). Custom logo/favicon uploads live in the BRANDING_ASSETS table and are served from `/api/branding/*`. Setting `HOMEPAGE_SHOW_MAILING_LISTS=false` hides the homepage's public mailing list directory (rendering the minimal `MailServerLandingPage` instead) for deployments used solely as an email template/sender

## Environment Setup

Copy `.env.example` to `.env.local`. Key variables:
- `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` — Neon database connection strings
- `MAIL_TRANSPORT` — default outbound mail transport: `resend` (default), `smtp`, or `test-database-transport`
- `RESEND_API_KEY` — Resend email service key (setting it makes the `resend` transport available)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` — SMTP relay settings (setting `SMTP_HOST` makes the `smtp` transport available)
- `TEST_DATABASE_MAIL_TRANSPORT_ENABLED` — set to `true` to make the fake-send `test-database-transport` available (leave unset in production)
- `SCHEMAVAULTS_AUTH_JWKS_ACCESS_PRIVATE_KEY` — JWT private key for auth
- `SCHEMAVAULTS_GITHUB_PACKAGE_REGISTRY_TOKEN` — required for installing `@schemavaults/*` packages from GitHub npm registry

## Database

Schema is managed via migrations (see `src/lib/mail-db/migrations/`). Type definitions live in `src/lib/mail-db/`. Tables:
- **MAILING_LISTS** — id, name, description, public flag, created_at
- **SUBSCRIBERS** — mailing_list_id (FK), email, subscribe_time
- **UNSUBSCRIBE_RECORDS** — mailing_list_id (FK), email, unsubscribe_time
- **API_KEYS** — hashed API keys for programmatic access to `/api/send`; `allow_any_audience` explicitly grants a key access to send to any recipient
- **API_KEY_MAILING_LIST_ALLOWLISTS** — mailing lists an API key may target (part of the combined audience allowlist)
- **API_KEY_RECIPIENT_ALLOWLISTS** — individual recipient emails an API key may target (part of the combined audience allowlist)
- **API_KEY_ALLOWED_SENDERS** — `from`/`replyTo` addresses an API key may send as (exact email or `*@domain` wildcard)
- **API_KEY_ALLOWED_TRANSPORTS** — mail transports (`resend`, `smtp`) an API key may deliver through
- **PENDING_SUBSCRIPTIONS** — double-opt-in confirmation tokens awaiting confirmation
- **CORS_ALLOWED_ORIGINS** — web origins allowed to make cross-origin requests to public API routes (managed at `/admin/cors`)
- **BRANDING_ASSETS** — admin-uploaded white-label assets (logo, favicon) stored base64-encoded (managed at `/admin/branding`)
- **TEST_EMAILS** — emails captured by the fake-send `test-database-transport` (read back via `/api/test-emails` in E2E tests)
- **TEST_EMAIL_ATTACHMENTS** — attachments of TEST_EMAILS rows (one row per file, base64 content + metadata, ordered by `attachment_index`; cascades on delete)
- **MAIL_TRANSPORT_SETTINGS** — admin-managed runtime transport settings; currently the enable/disable kill switch for the `test-database-transport`
