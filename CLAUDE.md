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
- **Hono** — each Next.js route handler is backed by its own small Hono app (see Key Patterns)
- **Zod v4 + @asteasolutions/zod-to-openapi** — request body validation on all API routes; the same schemas carry `.openapi()` annotations that generate the OpenAPI document
- **@schemavaults/auth-server-sdk** — JWT-based authentication with admin role guards

### API Routes (`src/app/api/`)
- `POST /api/send` — send emails (admin JWT or API key; supports react-email templates or raw HTML/text; optional `transport` property selects a configured transport)
- `GET /api/mailing-lists` — list mailing lists (public)
- `POST /api/mailing-lists` — create mailing list (admin only)
- `POST /api/mailing-lists/join` — subscribe to a mailing list
- `POST /api/mailing-lists/unsubscribe` — unsubscribe from a mailing list
- `POST /api/admin/init-db-tables` — initialize database schema (admin only)
- `GET /api/branding/[asset_kind]` — serve the uploaded logo/favicon (public; falls back to bundled defaults in `public/media/`)
- `PUT|DELETE /api/admin/branding/[asset_kind]` — upload/remove a custom logo or favicon (admin only; managed at `/admin/branding`)
- `GET /api/admin/transports` — list mail transports with configured/default/enabled status (admin only; shown at `/admin/transports`)
- `PATCH /api/admin/transports/[transport_id]` — enable/disable a transport's runtime kill switch (admin only; only the `test-database-transport` supports this, toggled at `/admin/transports`)
- `GET /api/test-emails` and `GET /api/test-emails/[test_email_id]` — list/read emails captured by the fake-send `test-database-transport` (admin JWT, or an API key whose transport scope permits the test-database transport; used by the E2E tests)
- `GET|POST /api/admin/api-keys` — list/create API keys (admin only; the plaintext token is returned exactly once on create)
- `PATCH|DELETE /api/admin/api-keys/[api_key_id]` — update (`name` renames the label; `allow_any_audience` toggles the key's permission to send to any recipient — the key ID, secret and scope entries are unchanged either way) or revoke an API key (admin only)
- `GET|POST|DELETE /api/admin/api-keys/[api_key_id]/allowlist|senders|recipients|transports` — manage one API key's scope entries (admin only; managed at `/admin/keys`)
- `GET /api/openapi.json` — the generated OpenAPI 3.1 document (public)
- `GET /docs` — self-hosted interactive API reference (public; server-rendered from the same OpenAPI document, no external CDN)

### Key Patterns
- **Per-route Hono apps**: every route.ts builds its own Hono app via `createRouteApp(path)` from `src/lib/hono/` — there is deliberately NO catch-all `/api/[[...route]]` mega-app. Handlers register relative to the route's full path (dynamic segments as Hono params, e.g. `/api/admin/api-keys/:api_key_id`) and are exported with `handle(app)` from `hono/vercel`. Shared helpers live in `src/lib/hono/`: JSON response envelopes (`responses.ts`), `parseJsonBody`, `parseUuidParam`, `runWithAdminGuard` / `runWithApiKeyOrAdminGuard` (admin-guard.ts, adapting the auth-server-sdk guards), and `corsMiddleware`. The four API-key scope routes are built by one factory (`scope-route-factory.ts` under the `[api_key_id]` folder)
- **OpenAPI document**: `/api/openapi.json` is generated with @asteasolutions/zod-to-openapi from per-route registrations — each route folder keeps a colocated `openapi.ts` exporting a `register*Paths(registry)` function built from the route's own zod schemas plus the shared builders in `src/lib/openapi/` (response envelopes, error-response maps, security schemes, tags, params). `src/lib/openapi/document.ts` aggregates every registration; when adding or changing a route, update its `openapi.ts` AND the registrar list + expected-paths test (`src/lib/openapi/__tests__/document.test.ts`). Schemas gain `.openapi()` metadata by importing `z` from `@/lib/zod-openapi` (which runs `extendZodWithOpenApi` exactly once) instead of from "zod"
- **Docs UI**: `/docs` is a server component page (`src/app/docs/page.tsx`), NOT a Hono route — it builds the OpenAPI document in-process, transforms it with `buildDocsViewModel()` (`src/lib/openapi/view-model.ts`: $ref-resolved schema trees, tag groups, generated curl examples; unit-tested) and renders it with the dedicated components in `src/components/ApiDocs/` (ApiReferenceView, DocsSidebar with scrollspy, OperationCard, SchemaTree) built on @schemavaults/ui primitives (HttpMethodBadge, CodeBlock, Collapsible). Fully self-hosted — no external CDN assets
- **Zod versions**: the app uses zod v4; the `@schemavaults/*` packages still bundle their own nested zod v3. The v3 schema from `@schemavaults/send-email` still validates `/api/send` at runtime (`parseJsonBody` accepts both structurally), but it cannot feed zod-to-openapi — `src/app/api/send/openapi.ts` keeps a v4 documentation mirror that must be kept in sync with the package schema
- **Admin guards**: API routes use `withAdminApiRouteGuard`, server components use `withAdminServerComponentRouteGuard` — both check `user.admin`
- **Mail transports**: `src/lib/mail-transport/` defines the `IMailTransport` interface with three implementations — Resend API, raw SMTP via nodemailer, and the fake-send `test-database-transport` (stores each email as a TEST_EMAILS row instead of delivering; built for E2E tests). Multiple transports can be configured at once: a transport is *available* when its env vars are set (`RESEND_API_KEY` → `resend`, `SMTP_HOST` → `smtp`, `TEST_DATABASE_MAIL_TRANSPORT_ENABLED` → `test-database-transport`; see `loadMailTransportsAvailability()`), and the `MAIL_TRANSPORT` env var selects the *default* transport (`resend` when unset) used when a send request omits its `transport` property. All sends go through `sendEmail()` / `sendEmailFromTemplate()` in `src/lib/`, which resolve the transport lazily at send time (`loadMailTransport(env, transportId?)`); transports receive only rendered `html`/`text` (react-email templates are rendered via `@react-email/render` before the transport is involved) and throw on delivery failure. No fallback between transports. On top of its env opt-in, the test-database transport has an admin-managed runtime kill switch (MAIL_TRANSPORT_SETTINGS row, toggled at `/admin/transports` via `PATCH /api/admin/transports/[transport_id]`) enforced both by `/api/send` (400) and inside `TestDatabaseMailTransport.send()`, so it can be shut off in production without a redeploy
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
- **MAIL_TRANSPORT_SETTINGS** — admin-managed runtime transport settings; currently the enable/disable kill switch for the `test-database-transport`
