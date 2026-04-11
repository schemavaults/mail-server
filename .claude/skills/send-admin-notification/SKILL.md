---
name: send-admin-notification
description: Send a notification email to the SchemaVaults admin mailing list via the schemavaults/mail-server `/api/send` route, using the `sendEmailToMailingList()` helper from `@schemavaults/send-email-api-options`. Use when any server-side TypeScript/JavaScript code needs to ping admins about signups, errors, billing events, ops alerts, or similar notifications.
---

# Send Admin Notification

This skill teaches Claude how to send a notification email to SchemaVaults admins from any server-side TypeScript/JavaScript project. It wraps the `schemavaults/mail-server` `POST /api/send` route via the `sendEmailToMailingList()` helper from `@schemavaults/send-email-api-options`, which automatically resolves the API key and mailing-list audience UUID from environment variables. The skill is self-contained and portable — drop the directory into any project's `.claude/skills/` folder and you're done.

## When to use this skill

Use it any time server-side code in another SchemaVaults project needs to fan an event out to admins, for example:

- New user signup / first-purchase events
- Unhandled errors in background jobs or cron tasks
- Billing / subscription lifecycle events (trial ending, payment failed)
- Ops alerts (deploy succeeded, rate-limit tripped, healthcheck failed)
- Any ad-hoc "FYI, this just happened" message intended for the admin audience

Do **not** use it for:

- Sending to individual end users (that's a different call — pass an email string to `sendEmail()` instead)
- Client-side / browser code (the API key is a secret)
- High-volume broadcasts beyond 50 recipients per send (the mail-server caps each send call at 50 recipients to respect Resend's per-call limit)

## Prerequisites

1. **Install the helper package** in the target project:
   ```bash
   bun add @schemavaults/send-email-api-options
   # or: npm install @schemavaults/send-email-api-options
   ```

2. **Set two environment variables** wherever the code runs (local dev, CI, production):
   - `SCHEMAVAULTS_MAIL_API_KEY` — Bearer token issued from the mail-server's `api_keys` table. Always starts with `svlts_mail_pk_`. Treat it like any other secret; never commit it, never ship it to browsers.
   - `SCHEMAVAULTS_MAILING_LIST_ID` — UUID of the admin mailing list from the mail-server's `MAILING_LISTS` table.

   Both are mandatory — the helper throws `Error("Failed to load … from environment variable …")` if either is missing.

3. **Optional third env var:** `SCHEMAVAULTS_APP_ENVIRONMENT` = `"production"` | `"development"` | `"staging"`. If unset, the helper falls back to `production` and targets the production mail-server. Only set this when you explicitly want to hit a non-prod environment.

4. **Call only from server-side code** — API routes, server actions, cron handlers, background workers. Never from a React client component or browser bundle.

## Usage — template form (preferred)

When a React Email template already exists in the mail-server catalog, reference it by `template_id` so the rendering (HTML + plain text) happens on the mail-server.

```ts
import { sendEmailToMailingList } from "@schemavaults/send-email-api-options";

export async function notifyAdminsOfSignup(userName: string): Promise<void> {
  await sendEmailToMailingList({
    body: {
      subject: `New signup: ${userName}`,
      message: {
        template_id: "my-test-email",
        template_props: { name: userName },
      },
    },
  });
}
```

### Templates currently in the catalog

The mail-server's catalog lives at `src/lib/EmailTemplatesCatalog/EmailTemplatesCatalog.ts` and template IDs are validated server-side — passing an unknown ID returns HTTP 400. At the time this skill was written, the registered templates are:

| `template_id`     | `template_props` shape                                     | Purpose                                      |
| ----------------- | ---------------------------------------------------------- | -------------------------------------------- |
| `my-test-email`   | `{ name: string }`                                         | Simple test / smoke test template.           |
| `password-reset`  | `{ resetLink: string; expiresInMinutes: number }`          | Password reset email with a magic link.      |

If none of these fits your notification, use the raw form below instead of trying to bend a mismatched template.

## Usage — raw HTML/text form (ad-hoc)

For one-off notifications where spinning up a dedicated React Email template is overkill, supply `text` and `html` directly. **Both fields are required.**

```ts
import { sendEmailToMailingList } from "@schemavaults/send-email-api-options";

export async function notifyAdminsOfError(err: Error, context: string): Promise<void> {
  const subject = `[alert] ${context}: ${err.message}`;
  const text =
    `An error occurred in ${context}.\n\n` +
    `Message: ${err.message}\n\n` +
    `Stack:\n${err.stack ?? "(no stack)"}\n`;
  const html =
    `<p>An error occurred in <code>${context}</code>.</p>` +
    `<p><strong>Message:</strong> ${err.message}</p>` +
    `<pre>${err.stack ?? "(no stack)"}</pre>`;

  await sendEmailToMailingList({
    body: { subject, message: { text, html } },
  });
}
```

Escape user-supplied values before embedding them in `html` if they can contain `<` / `>` / `&` — the mail-server does not sanitize this for you.

## Request body shape

`sendEmailToMailingList` accepts `Omit<SendEmailRequestBody, "to" | "cc" | "bcc">` — the audience is the mailing list, so `to`, `cc`, and `bcc` are intentionally not allowed. Allowed fields:

```ts
type AdminNotificationBody = {
  subject: string;
  message:
    | { template_id: string; template_props?: unknown }
    | { text: string; html: string };
  from?: string;      // defaults to the mail-server's configured sender
  replyTo?: string;   // optional reply-to override
};

// Full call signature:
type ISendEmailToMailingListOpts = {
  body: AdminNotificationBody;
  bearerToken?: string;   // override SCHEMAVAULTS_MAIL_API_KEY; rarely needed
  mailServerUrl?: string; // override the server origin; rarely needed
  environment?: "production" | "development" | "staging";
};
```

## Error handling

The helper throws on any non-200 response — wrap the call in `try/catch` whenever a failed admin ping should **not** break the caller's primary flow (e.g. don't block a user signup just because the admin notification failed):

```ts
try {
  await sendEmailToMailingList({
    body: {
      subject: `New signup: ${userName}`,
      message: { text, html },
    },
  });
} catch (notifyErr) {
  // Log and swallow — the signup itself already succeeded.
  console.error("[admin-notify] failed to send admin notification", notifyErr);
}
```

Common failure modes:

| Error                                                                      | Cause                                                                                       |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Failed to load API key from environment variable 'SCHEMAVAULTS_MAIL_API_KEY'` | Env var not set (or empty string) in the runtime environment.                             |
| `Failed to load mailing list ID from environment variable 'SCHEMAVAULTS_MAILING_LIST_ID'` | Env var not set (or empty string) in the runtime environment.                   |
| `Bad request body to send email with!`                                     | Your `body` does not match the schema — typically a missing `subject`, missing `text`/`html` pair, or unknown fields. |
| `Invalid or revoked API key.` (HTTP 401)                                   | `SCHEMAVAULTS_MAIL_API_KEY` is wrong, expired, or revoked.                                  |
| `This API key is not permitted…` (HTTP 403)                                | The API key is allowlisted to a different mailing list than the one in `SCHEMAVAULTS_MAILING_LIST_ID`. |
| `Failed to parse request body!` (HTTP 400)                                 | Server-side Zod parsing failed; usually a template `template_props` shape mismatch.         |

## Environment targeting

By default the helper resolves the mail-server URL for the `production` environment. To hit staging or development explicitly:

```ts
await sendEmailToMailingList({
  environment: "development",
  body: {
    subject: "dev smoke test",
    message: { template_id: "my-test-email", template_props: { name: "admin" } },
  },
});
```

Or set `SCHEMAVAULTS_APP_ENVIRONMENT` at the process level — the helper reads it via `getAppEnvironment()` from `@schemavaults/app-definitions` when `opts.environment` is not passed in.

## Adding this skill to another project

This skill is designed to be copied verbatim between repos.

1. Copy the `.claude/skills/send-admin-notification/` directory (this file) into the target project's `.claude/skills/` folder.
2. In the target project, install the helper package:
   ```bash
   bun add @schemavaults/send-email-api-options
   ```
3. Populate the two environment variables via the project's normal secret management (e.g. `.env.local` for local dev, your hosting provider's secret store for production):
   ```bash
   SCHEMAVAULTS_MAIL_API_KEY=svlts_mail_pk_...
   SCHEMAVAULTS_MAILING_LIST_ID=00000000-0000-0000-0000-000000000000
   ```
4. Commit the skill directory. The next Claude Code session in that repo will automatically discover the skill and know how to use it without any further configuration.

To mint a new API key or provision the admin mailing list, use the existing admin endpoints on the mail-server — those are operational tasks and live outside the scope of this skill.

## Reference

Source files inside the installed package (`node_modules/@schemavaults/send-email-api-options/dist/`) — read these when you need ground truth:

- `send-email-to-mailing-list.{d.ts,js}` — the `sendEmailToMailingList()` helper and its `ISendEmailToMailingListOpts` interface.
- `send-email.{d.ts,js}` — the underlying `sendEmail()` implementation, including `getSchemaVaultsMailApiKey()` and server-URL resolution.
- `send-email-request-body-schema.{d.ts,js}` — the Zod schema (`createSendEmailRequestBodySchema`) that both the client helper and the mail-server route use to validate bodies.
- `index.d.ts` — package entry point; lists every exported symbol.

On the mail-server side, the canonical references are:

- `src/app/api/send/route.ts` — the `POST /api/send` handler (auth, template validation, 50-recipient cap, response shape).
- `src/lib/EmailTemplatesCatalog/EmailTemplatesCatalog.ts` — authoritative list of template IDs available via the `template_id` form.
