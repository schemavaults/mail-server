# E2E tests

End-to-end tests for the full `/api/send` flow, using the fake-send
`test-database-transport`: each send is stored as a `TEST_EMAILS` row instead
of being delivered, then read back through `GET /api/test-emails` /
`GET /api/test-emails/:test_email_id`. No real SMTP/Resend delivery is ever
involved.

The suite talks to a **running** mail-server over HTTP and skips itself
entirely unless `E2E_MAIL_SERVER_BASE_URL` is set, so a plain `bun test`
stays unit-only. CI runs it in the `e2e` job of
`.github/workflows/ci.yml`, which is also the reference for the full setup:

1. Start Postgres with **cleartext password host auth**
   (`POSTGRES_HOST_AUTH_METHOD=password`) — the Neon serverless driver the
   app uses in non-production environments pipelines a cleartext
   `PasswordMessage` on connect.
2. Start the WebSocket→TCP proxy the driver tunnels through:
   `bun e2e/setup/ws-proxy.ts` (listens on `:5433`, pipes to Postgres).
3. Run migrations: `bun run migrate:development` (reads `.env.development`).
4. Seed the E2E API key: `bun e2e/setup/seed-e2e-api-key.ts` (reads
   `POSTGRES_URL` + `E2E_MAIL_SERVER_API_KEY`).
5. Build and start the app with (at minimum):
   `SCHEMAVAULTS_APP_ENVIRONMENT=development`, `POSTGRES_*` pointing at the
   local database, `TEST_DATABASE_MAIL_TRANSPORT_ENABLED=true`, and
   `MAIL_TRANSPORT=test-database-transport`.
6. Run the tests: `bun run test:e2e` with
   - `E2E_MAIL_SERVER_BASE_URL` — e.g. `http://localhost:5346`
   - `E2E_MAIL_SERVER_API_KEY` — the key seeded in step 4
   - `E2E_DEFAULT_TRANSPORT_IS_TEST_DATABASE=true` — only when the server's
     `MAIL_TRANSPORT` is `test-database-transport`; enables the
     default-transport test. Leave unset against a server whose default is a
     real transport, so the suite never triggers a real delivery.
