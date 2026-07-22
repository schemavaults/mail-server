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
- **Resend** — email sending service
- **react-email** — email templates as React components
- **Kysely + Neon PostgreSQL** — type-safe query builder over serverless Postgres
- **Zod** — request body validation on all API routes
- **@schemavaults/auth-server-sdk** — JWT-based authentication with admin role guards

### API Routes (`src/app/api/`)
- `POST /api/send` — send emails (admin only; supports react-email templates or raw HTML/text)
- `GET /api/mailing-lists` — list mailing lists (public)
- `POST /api/mailing-lists` — create mailing list (admin only)
- `POST /api/mailing-lists/join` — subscribe to a mailing list
- `POST /api/mailing-lists/unsubscribe` — unsubscribe from a mailing list
- `POST /api/admin/init-db-tables` — initialize database schema (admin only)

### Key Patterns
- **Admin guards**: API routes use `withAdminApiRouteGuard`, server components use `withAdminServerComponentRouteGuard` — both check `user.admin`
- **Email template catalog**: `src/email-templates/catalog.ts` exports a registry mapping template names to React components; the `/api/send` route resolves templates by name and renders them with provided props
- **Database migrations**: Migration files live in `src/lib/mail-db/migrations/` as TypeScript, numbered sequentially (`00000-`, `00001-`, …). Each exports `up`/`down` functions taking a `Kysely<any>` instance. Raw SQL uses the `sql` tag re-exported from `src/lib/mail-db/sql.ts`. Migrations are compiled via `@schemavaults/dbh` to `dist/migrations/` before running. Per-environment env files (`.env.development`, `.env.test`, `.env.production`) provide DB credentials
- **Auth codegen**: Auth routes under `src/app/auth/` are auto-generated and gitignored; always run `bun run auth-codegen` (or use `dev:app`/`build` which do it automatically)

## Environment Setup

Copy `.env.example` to `.env.local`. Key variables:
- `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` — Neon database connection strings
- `RESEND_API_KEY` — Resend email service key
- `SCHEMAVAULTS_AUTH_JWKS_ACCESS_PRIVATE_KEY` — JWT private key for auth
- `SCHEMAVAULTS_GITHUB_PACKAGE_REGISTRY_TOKEN` — required for installing `@schemavaults/*` packages from GitHub npm registry

## Database

Schema is managed via migrations (see `src/lib/mail-db/migrations/`). Type definitions live in `src/lib/mail-db/`. Tables:
- **MAILING_LISTS** — id, name, description, public flag, created_at
- **SUBSCRIBERS** — mailing_list_id (FK), email, subscribe_time
- **UNSUBSCRIBE_RECORDS** — mailing_list_id (FK), email, unsubscribe_time
- **API_KEYS** — hashed API keys for programmatic access to `/api/send`
- **API_KEY_MAILING_LIST_ALLOWLISTS** — restricts an API key to specific mailing lists
- **PENDING_SUBSCRIPTIONS** — double-opt-in confirmation tokens awaiting confirmation
- **CORS_ALLOWED_ORIGINS** — web origins allowed to make cross-origin requests to public API routes (managed at `/admin/cors`)
