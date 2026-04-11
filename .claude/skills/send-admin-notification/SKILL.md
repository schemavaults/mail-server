---
name: send-admin-notification
description: Send a notification email to the SchemaVaults admin mailing list via the schemavaults/mail-server `/api/send` route, using the `sendEmailToMailingList()` helper from `@schemavaults/send-email-api-options`. Use when any server-side TypeScript/JavaScript code needs to ping admins about signups, errors, billing events, or ops alerts — **or when Claude Code itself wants to send a one-shot "I just finished this workflow" notification to admins at the end of a task** (by writing a short script to `/tmp/` and running it with `bun`).
---

# Send Admin Notification

This skill teaches Claude how to send a notification email to SchemaVaults admins, either (a) from any server-side TypeScript/JavaScript project that imports `@schemavaults/send-email-api-options`, or (b) directly from a Claude Code session — for example, to tell admins "I just finished this workflow" at the end of a task. In both cases the same `sendEmailToMailingList()` helper wraps the `schemavaults/mail-server` `POST /api/send` route and automatically resolves the API key and mailing-list audience UUID from environment variables. The skill is self-contained and portable — drop the directory into any project's `.claude/skills/` folder and you're done.

## When to use this skill

There are two distinct use cases. Either fits this skill:

**(a) Application code in a SchemaVaults project needs to ping admins about an event.** For example:

- New user signup / first-purchase events
- Unhandled errors in background jobs or cron tasks
- Billing / subscription lifecycle events (trial ending, payment failed)
- Ops alerts (deploy succeeded, rate-limit tripped, healthcheck failed)
- Any ad-hoc "FYI, this just happened" message intended for the admin audience

**(b) Claude Code itself wants to notify admins at the end of a workflow.** For example:

- Claude just finished implementing a feature and pushed the branch.
- Claude finished reviewing a PR and posted comments.
- A long-running build, migration, or CI task finished (success or failure).
- A scheduled maintenance script Claude was orchestrating completed.

For use case (b), see the "Usage — Claude Code post-workflow notification" section below for the concrete `/tmp/send-notification-to-admin-after-workflow.ts` pattern.

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
        // Replace with a real template_id from `GET /api/templates`
        // (see "Discovering available templates" below). This skill
        // does not hardcode a template list because it drifts across repos.
        template_id: "<template-id-from-GET-/api/templates>",
        template_props: {
          /* prop shape per the template's description field */
        },
      },
    },
  });
}
```

### Discovering available templates

Registered templates **can change over time**. This skill intentionally does not hardcode a list — copying stale template tables across repos is exactly how consumers end up calling non-existent IDs and getting HTTP 400s. Instead, query the live catalog via `GET /api/templates`, which accepts the same API-key bearer-token auth as `POST /api/send`.

**From a shell:**

```bash
# Replace <mail-server-origin> with the mail-server's URL for your environment.
curl -sS \
  -H "Authorization: Bearer $SCHEMAVAULTS_MAIL_API_KEY" \
  https://<mail-server-origin>/api/templates
```

**From a Node/Bun script** — re-using the helper package's own environment-aware URL resolution so you don't have to know the origin:

```ts
import {
  getHardcodedApiServerDomain,
  SCHEMAVAULTS_MAIL_APP_DEFINITION,
} from "@schemavaults/app-definitions";

const { domain } = getHardcodedApiServerDomain(
  SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id,
  "production", // or "development" / "staging"
);

const response = await fetch(`${domain}/api/templates`, {
  headers: {
    Authorization: `Bearer ${process.env.SCHEMAVAULTS_MAIL_API_KEY}`,
  },
});
const { data } = (await response.json()) as {
  success: true;
  data: Array<{ id: string; description: string }>;
};
console.log(data);
```

**Response shape:**

```json
{
  "success": true,
  "data": [
    {
      "id": "<template-id>",
      "description": "<human-readable blurb; usually documents the expected props shape>"
    }
  ]
}
```

Each entry has an `id` (pass this verbatim as `template_id`) and a `description` that, by convention, documents the expected `template_props` shape. If the description is ambiguous, either (a) pass the props and let the server reject malformed calls with HTTP 400, or (b) read the template's source file in the mail-server repo at `src/lib/EmailTemplatesCatalog/email-template-refs/<id>.ts` for authoritative type info.

Errors:

- **401** `Invalid or revoked API key.` — `SCHEMAVAULTS_MAIL_API_KEY` is wrong, expired, or revoked. Same auth path as `POST /api/send`.
- **500** `Failed to list email templates!` — unexpected server-side failure while loading the catalog; retry or escalate.

**If none of the registered templates fits your notification**, use the raw `text`/`html` form below instead of trying to bend a mismatched template. The raw form is always available and never depends on the catalog.

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

## Usage — Claude Code post-workflow notification

Claude itself can use this skill to send a one-shot "I just finished X" notification to admins at the end of a workflow in any repo that depends on `@schemavaults/send-email-api-options` (this repo already does). Because the helper lives in `node_modules/`, Claude can drop a standalone TypeScript file into `/tmp/` and run it with Bun — no new dependencies, no build step, no changes to the repo under review.

### Pattern

1. **Write the script to `/tmp/send-notification-to-admin-after-workflow.ts`** (fresh on every run — `/tmp/` is scratch space, overwrite freely):

   ```ts
   // /tmp/send-notification-to-admin-after-workflow.ts
   import { sendEmailToMailingList } from "@schemavaults/send-email-api-options";

   async function main(): Promise<void> {
     await sendEmailToMailingList({
       body: {
         subject: "[claude-code] workflow finished: <short description>",
         message: {
           text:
             "Claude just finished a workflow on schemavaults/mail-server.\n\n" +
             "Summary:\n" +
             "- <bullet 1>\n" +
             "- <bullet 2>\n" +
             "- <bullet 3>\n",
           html:
             "<p>Claude just finished a workflow on <code>schemavaults/mail-server</code>.</p>" +
             "<p><strong>Summary:</strong></p>" +
             "<ul>" +
             "<li>&lt;bullet 1&gt;</li>" +
             "<li>&lt;bullet 2&gt;</li>" +
             "<li>&lt;bullet 3&gt;</li>" +
             "</ul>",
         },
       },
     });
     console.log("[admin-notify] sent");
   }

   main().catch((err) => {
     console.error("[admin-notify] failed:", err);
     process.exit(1);
   });
   ```

2. **Fill in real content.** Replace `<short description>` and the bullet placeholders with a concrete summary of what the workflow actually did — e.g. `"implemented feature X"`, `"fixed bug Y"`, `"reviewed PR #123 and left 4 comments"`. Keep the subject under ~70 characters and the body scannable (3–5 bullets is usually enough).

3. **Run it from the repo root** so Bun resolves `@schemavaults/send-email-api-options` through the repo's `node_modules/`:

   ```bash
   bun run /tmp/send-notification-to-admin-after-workflow.ts
   ```

4. **Check the exit code.** `0` means the email was accepted by the mail-server. Non-zero means the helper threw — surface the error in your summary to the user rather than retrying silently.

### When to trigger this

Send **exactly one** notification at the **end** of a workflow, after all commits and pushes have landed, so the email reflects the final state:

- A feature or fix has been implemented and pushed to the remote branch.
- A PR review has been completed and comments posted.
- A long-running build, migration, or CI task finished (mention success vs. failure in the subject).
- A scheduled maintenance or cleanup script Claude was orchestrating completed.

### Cautions

- The env vars `SCHEMAVAULTS_MAIL_API_KEY` and `SCHEMAVAULTS_MAILING_LIST_ID` must be set in Claude's process. If they're missing, the helper throws a clear error — report it to the user instead of retrying blindly.
- **One notification per workflow, not per step.** If a workflow had no meaningful outcome (e.g. "user asked a question, Claude answered"), skip the notification entirely. The admin inbox should not become chatty.
- **Do not send the notification before the work is finished.** Push first, notify second — otherwise the email will describe a state that isn't on `origin` yet.
- **Ask before sending** if the user hasn't explicitly opted in to post-workflow notifications. Sending email is a side effect visible to other humans; don't do it silently on tasks where the user hasn't asked for it.

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
- `src/app/api/templates/route.ts` — the `GET /api/templates` handler (dual auth: API key or admin JWT; returns `{ id, description }` per registered template).
- `src/lib/EmailTemplatesCatalog/EmailTemplatesCatalog.ts` — authoritative list of template IDs; the source `GET /api/templates` reads from.
