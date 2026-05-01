---
name: add-email-template
description: Use when adding a new transactional email template to the mail-server codebase. Enumerates every file that must be created or modified to wire up a new template end-to-end (react-email component, catalog entry class, catalog registration, admin preview sample props) and the exact pattern to follow for each.
---

# Add a new email template

Adding a new transactional email to this mail-server requires changes in **three places**. Missing any of them leaves the template broken in a subtle way — most commonly a `400` in the `/admin/templates` iframe preview when sample props are forgotten.

Use a consistent naming convention across the touchpoints:

- **template id** → `kebab-case` (e.g. `team-invitation`) — this is the public identifier used in API requests, the URL query param, and the catalog key
- **component file** → `kebab-case.tsx` (e.g. `team-invitation.tsx`)
- **catalog entry file/class** → `PascalCase.ts` (e.g. `TeamInvitation.ts` exporting class `TeamInvitation`)
- **props interface** → `<Pascal>EmailProps` (e.g. `TeamInvitationEmailProps`)

## Files to create/modify

### 1. Create the react-email component

**File:** `src/email-templates/<kebab-name>.tsx` (new)

- Export a TypeScript `interface <Pascal>EmailProps` with required fields unmarked and optional fields marked `?`
- Export `default function <Pascal>Email(props): ReactElement` built from `@react-email/components` primitives (`Html`, `Head`, `Body`, `Container`, `Section`, `Preview`, `Heading`, `Text`, `Button`, `Hr`, etc.)
- At the top of the component, throw on missing required props when `process.env.NODE_ENV !== "development"`, so that a bad send fails loudly outside dev but the react-email dev server (`bun run dev:mail`) still renders with partial data
- Resolve optional props with `typeof x === "string" && x.length > 0 ? x : defaultValue` — keep the brand-token hex constants inline (`BRAND_BLUE`, `BRAND_BLUE_DARK`, `FOREGROUND`, etc.) since email clients don't resolve CSS custom properties
- Attach `<Pascal>Email.PreviewProps = { ... } satisfies <Pascal>EmailProps` at the bottom of the file. **This is the single source of truth for sample props** — the `bun run dev:mail` preview, the `/admin/templates` iframe preview, and the `validateProps` unit test all read from `.PreviewProps` via `src/lib/EmailTemplatesCatalog/sampleProps.ts`. Any payload you put here MUST also pass the catalog entry's `validateProps` (the unit test enforces this in CI)

Reference: `src/email-templates/team-invitation.tsx` (matches every convention above).

### 2. Create the catalog entry class

**File:** `src/lib/EmailTemplatesCatalog/email-template-refs/<Pascal>.ts` (new)

Class extends `EmailTemplatesCatalogEntry<<Pascal>EmailProps>` from `../EmailTemplatesCatalogEntry` and implements:

- `public id = "<kebab-name>" as const satisfies string;` — **must match** the catalog key from step 3
- `public description = "..."` — short marketing-copy description used in the admin UI; include a props summary at the end
- `public validateProps(val: unknown): val is <Pascal>EmailProps` — narrowing type guard. Reject non-objects, require each required prop is a string, and for each optional prop allow it to be absent, `undefined`, or a string. **Throw `BadEmailTemplatePropsError` (from `@/lib/error/BadEmailTemplatePropsError`) with a descriptive message on every failure path** — never `return false`. The thrown `message` is surfaced verbatim in the 400 body of `/api/send`. Pattern: see `src/lib/EmailTemplatesCatalog/email-template-refs/TeamInvitation.ts`
- `public async loadReactEmailTemplate()` — dynamic `import("@/email-templates/<kebab-name>").then((mod) => mod.default)`
- `public async renderPlainTextVersion(props)` — hand-rolled plain-text fallback (array of lines, `.join("\n")`). Apply the same optional-prop defaulting you do in the component

Reference: `src/lib/EmailTemplatesCatalog/email-template-refs/TeamInvitation.ts` (copy-and-adapt).

### 3. Register in the catalog and wire up sample props

**Files:**
- `src/lib/EmailTemplatesCatalog/EmailTemplatesCatalog.ts` (edit)
- `src/lib/EmailTemplatesCatalog/sampleProps.ts` (edit)

Add one line to the `EmailTemplatesCatalog` object:

```ts
"<kebab-name>": async () =>
  import("./email-template-refs/<Pascal>").then((m) => m.default),
```

Then add a matching entry to `sampleEmailTemplateProps` in `sampleProps.ts` that points to the new component's `.PreviewProps`:

```ts
import <Pascal>Email from "@/email-templates/<kebab-name>";

export const sampleEmailTemplateProps = {
  // ...existing entries...
  "<kebab-name>": <Pascal>Email.PreviewProps,
} satisfies Record<EmailTemplateId, Record<string, unknown>>;
```

The `satisfies` clause makes a missing entry a TypeScript error. Do **not** copy the prop values inline — always reference `.PreviewProps` so there is exactly one source of truth.

Everything else is derived automatically:
- `EmailTemplateId` union type
- `isValidTemplateId()` (`isValidTemplateId.ts`) — used by `/api/send` and the preview route
- `emailTemplateIdSchema` zod schema (`EmailTemplateIdSchema.ts`)
- The `/admin/templates` iframe preview reads sample props via `sampleEmailTemplateProps[templateId]`
- The `validateProps` unit test in `src/lib/EmailTemplatesCatalog/__tests__/validateProps.test.ts` automatically picks up the new template

Do **not** edit `isValidTemplateId.ts`, `EmailTemplateIdSchema.ts`, or `src/app/api/admin/templates/preview/route.ts` (which now imports `sampleEmailTemplateProps`) — they all derive from the catalog object and the shared sample-props module.

## Verification

1. `bun run typecheck` — ensures the new catalog entry and `sampleProps.ts` entry are wired up correctly (a missing entry surfaces here)
2. `bun test` — runs the validateProps suite; it MUST pass for the new template's `.PreviewProps` against its `validateProps`
3. `bun run dev:mail` — start the react-email preview server on port 5347; confirm the new template renders there from its `PreviewProps`
4. `bun run dev:app` — start the Next.js app on port 5346
5. Sign in as an admin and open `/admin/templates` in the browser
6. Select the new template in the list; the iframe must render the full email (not the 400 error banner)
7. Spot-check an existing template (e.g. `welcome`) to confirm no regression in the catalog wiring
8. (Optional) Hit `POST /api/send` as an admin with `{ template_id: "<kebab-name>", template_props: { ... }, to: "you@example.com", subject: "..." }` to verify end-to-end send via Resend

## Quick checklist

- [ ] `src/email-templates/<kebab-name>.tsx` — component + `.PreviewProps` (single source of truth for sample props)
- [ ] `src/lib/EmailTemplatesCatalog/email-template-refs/<Pascal>.ts` — catalog entry class (validateProps throws `BadEmailTemplatePropsError` on bad input)
- [ ] `src/lib/EmailTemplatesCatalog/EmailTemplatesCatalog.ts` — one-line registration
- [ ] `src/lib/EmailTemplatesCatalog/sampleProps.ts` — one-line entry pointing to `<Pascal>Email.PreviewProps`
- [ ] `bun run typecheck` clean
- [ ] `bun test` passes
- [ ] `bun run dev:mail` preview renders
- [ ] `/admin/templates` iframe preview renders (no 400)
