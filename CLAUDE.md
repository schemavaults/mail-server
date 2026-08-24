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
- **Zod** — request body validation on all API routes
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
- `GET /api/admin/transports` — list mail transports with configured/default status (admin only; shown at `/admin/transports`)
- `GET|POST /api/admin/api-keys` — list/create API keys (admin only; the plaintext token is returned exactly once on create)
- `PATCH|DELETE /api/admin/api-keys/[api_key_id]` — rename (label only; the key ID, secret and scopes are unchanged) or revoke an API key (admin only)
- `GET|POST|DELETE /api/admin/api-keys/[api_key_id]/allowlist|senders|recipients|transports` — manage one API key's scope entries (admin only; managed at `/admin/keys`)

### Key Patterns
- **Admin guards**: API routes use `withAdminApiRouteGuard`, server components use `withAdminServerComponentRouteGuard` — both check `user.admin`
- **Mail transports**: `src/lib/mail-transport/` defines the `IMailTransport` interface with two implementations — Resend API and raw SMTP via nodemailer. Multiple transports can be configured at once: a transport is *available* when its env vars are set (`RESEND_API_KEY` → `resend`, `SMTP_HOST` → `smtp`; see `loadMailTransportsAvailability()`), and the `MAIL_TRANSPORT` env var selects the *default* transport (`resend` when unset) used when a send request omits its `transport` property. All sends go through `sendEmail()` / `sendEmailFromTemplate()` in `src/lib/`, which resolve the transport lazily at send time (`loadMailTransport(env, transportId?)`); transports receive only rendered `html`/`text` (react-email templates are rendered via `@react-email/render` before the transport is involved) and throw on delivery failure. No fallback between transports
- **API key scoping**: `/api/send` calls authenticated with an API key are checked against three independent per-key scope dimensions, each unrestricted when it has zero entries: **audience** (API_KEY_MAILING_LIST_ALLOWLISTS + API_KEY_RECIPIENT_ALLOWLISTS form ONE combined allowlist — a restricted key may only pass a single allowlisted mailing-list UUID in `to`, or individual addresses that are all allowlisted, and may only cc/bcc allowlisted individuals), **senders** (API_KEY_ALLOWED_SENDERS entries are exact emails or `*@domain` wildcards; `from` — after falling back to the default sender — and `replyTo` must match; matching helpers live in `src/lib/api-keys/sender-scope.ts`), and **transports** (API_KEY_ALLOWED_TRANSPORTS; the resolved transport, explicit or default, must be allowed). Admin JWT callers bypass all scopes. Scopes are managed per key at `/admin/keys`
- **Email template catalog**: `src/email-templates/catalog.ts` exports a registry mapping template names to React components; the `/api/send` route resolves templates by name and renders them with provided props
- **Database migrations**: Migration files live in `src/lib/mail-db/migrations/` as TypeScript, numbered sequentially (`00000-`, `00001-`, …). Each exports `up`/`down` functions taking a `Kysely<any>` instance. Raw SQL uses the `sql` tag re-exported from `src/lib/mail-db/sql.ts`. Migrations are compiled via `@schemavaults/dbh` to `dist/migrations/` before running. Per-environment env files (`.env.development`, `.env.test`, `.env.production`) provide DB credentials
- **Auth codegen**: Auth routes under `src/app/auth/` are auto-generated and gitignored; always run `bun run auth-codegen` (or use `dev:app`/`build` which do it automatically)
- **White-label branding**: All brand identity (name, URLs, support email, colors, footer links, mail sender) is configured via `BRAND_*` / `MAIL_FROM_*` environment variables (see `.env.example`). `src/email-templates/brand.ts` exports `getEmailBrand()` used by every email template as the fallback for brand-related props — never hardcode a brand name in template copy. `src/lib/branding.ts` exposes the fuller `getBrandConfig()` threaded to client components via `BrandingContext` (use the `useBranding()` hook, or `<BrandWordmark />` for the gradient wordmark). Custom logo/favicon uploads live in the BRANDING_ASSETS table and are served from `/api/branding/*`. Setting `HOMEPAGE_SHOW_MAILING_LISTS=false` hides the homepage's public mailing list directory (rendering the minimal `MailServerLandingPage` instead) for deployments used solely as an email template/sender

## Environment Setup

Copy `.env.example` to `.env.local`. Key variables:
- `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` — Neon database connection strings
- `MAIL_TRANSPORT` — default outbound mail transport: `resend` (default) or `smtp`
- `RESEND_API_KEY` — Resend email service key (setting it makes the `resend` transport available)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` — SMTP relay settings (setting `SMTP_HOST` makes the `smtp` transport available)
- `SCHEMAVAULTS_AUTH_JWKS_ACCESS_PRIVATE_KEY` — JWT private key for auth
- `SCHEMAVAULTS_GITHUB_PACKAGE_REGISTRY_TOKEN` — required for installing `@schemavaults/*` packages from GitHub npm registry

## Database

Schema is managed via migrations (see `src/lib/mail-db/migrations/`). Type definitions live in `src/lib/mail-db/`. Tables:
- **MAILING_LISTS** — id, name, description, public flag, created_at
- **SUBSCRIBERS** — mailing_list_id (FK), email, subscribe_time
- **UNSUBSCRIBE_RECORDS** — mailing_list_id (FK), email, unsubscribe_time
- **API_KEYS** — hashed API keys for programmatic access to `/api/send`
- **API_KEY_MAILING_LIST_ALLOWLISTS** — restricts an API key to specific mailing lists (part of the combined audience allowlist)
- **API_KEY_RECIPIENT_ALLOWLISTS** — individual recipient emails an API key may target (part of the combined audience allowlist)
- **API_KEY_ALLOWED_SENDERS** — `from`/`replyTo` addresses an API key may send as (exact email or `*@domain` wildcard)
- **API_KEY_ALLOWED_TRANSPORTS** — mail transports (`resend`, `smtp`) an API key may deliver through
- **PENDING_SUBSCRIPTIONS** — double-opt-in confirmation tokens awaiting confirmation
- **CORS_ALLOWED_ORIGINS** — web origins allowed to make cross-origin requests to public API routes (managed at `/admin/cors`)
- **BRANDING_ASSETS** — admin-uploaded white-label assets (logo, favicon) stored base64-encoded (managed at `/admin/branding`)
