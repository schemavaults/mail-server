---
name: add-email-template
description: Use when adding a new transactional email template to the mail-server codebase. Enumerates every file that must be created or modified to wire up a new template end-to-end (react-email component, catalog entry class, catalog registration, admin preview sample props) and the exact pattern to follow for each.
---

# Add a new email template

Adding a new transactional email to this mail-server requires changes in **four places**. Missing any of them leaves the template broken in a subtle way — most commonly a `400` in the `/admin/templates` iframe preview when sample props are forgotten.

Use a consistent naming convention across the four touchpoints:

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
- Attach `<Pascal>Email.PreviewProps = { ... } satisfies <Pascal>EmailProps` at the bottom of the file — this is what the `bun run dev:mail` (react-email) server picks up and it doubles as the source-of-truth fixture you should mirror in step 4

Reference: `src/email-templates/team-invitation.tsx` (matches every convention above).

### 2. Create the catalog entry class

**File:** `src/lib/EmailTemplatesCatalog/email-template-refs/<Pascal>.ts` (new)

Class extends `EmailTemplatesCatalogEntry<<Pascal>EmailProps>` from `../EmailTemplatesCatalogEntry` and implements:

- `public id = "<kebab-name>" as const satisfies string;` — **must match** the catalog key from step 3
- `public description = "..."` — short marketing-copy description used in the admin UI; include a props summary at the end
- `public validateProps(val: unknown): val is <Pascal>EmailProps` — narrowing type guard. Reject non-objects, require each required prop is a string, and for each optional prop allow it to be absent, `undefined`, or a string. Pattern: see `src/lib/EmailTemplatesCatalog/email-template-refs/TeamInvitation.ts:11-77`
- `public async loadReactEmailTemplate()` — dynamic `import("@/email-templates/<kebab-name>").then((mod) => mod.default)`
- `public async renderPlainTextVersion(props)` — hand-rolled plain-text fallback (array of lines, `.join("\n")`). Apply the same optional-prop defaulting you do in the component

Reference: `src/lib/EmailTemplatesCatalog/email-template-refs/TeamInvitation.ts` (copy-and-adapt).

### 3. Register in the catalog

**File:** `src/lib/EmailTemplatesCatalog/EmailTemplatesCatalog.ts` (edit)

Add one line to the `EmailTemplatesCatalog` object:

```ts
"<kebab-name>": async () =>
  import("./email-template-refs/<Pascal>").then((m) => m.default),
```

Everything else is derived automatically:
- `EmailTemplateId` union type (`EmailTemplatesCatalog.ts:19`)
- `isValidTemplateId()` (`isValidTemplateId.ts`) — used by `/api/send` and the preview route
- `emailTemplateIdSchema` zod schema (`EmailTemplateIdSchema.ts`)

Do **not** edit `isValidTemplateId.ts` or `EmailTemplateIdSchema.ts` — they derive from the catalog object at runtime.

### 4. Add sample props for the admin preview iframe

**File:** `src/app/api/admin/templates/preview/route.ts` (edit)

Add an entry for `"<kebab-name>"` to the `sampleProps: Record<string, Record<string, unknown>>` map at the top of the file. **This is the step that is easiest to forget** — without it, the `/admin/templates` iframe at `src/app/admin/templates/templates-browser-client.tsx:89` falls back to `{}` (see `route.ts:82`: `sampleProps[templateId] ?? {}`), which fails `validateProps()` and returns a 400 to the iframe.

Mirror the values you already wrote in `<Pascal>Email.PreviewProps` so the admin iframe preview matches the react-email dev preview exactly.

## Verification

1. `bun run dev:app` — start the Next.js app on port 5346
2. `bun run dev:mail` — start the react-email preview server on port 5347; confirm the new template renders there from its `PreviewProps`
3. Sign in as an admin and open `/admin/templates` in the browser
4. Select the new template in the list; the iframe must render the full email (not the 400 error banner)
5. Spot-check an existing template (e.g. `welcome`) to confirm no regression in the catalog wiring
6. `bun run typecheck` — verify the new catalog entry type-checks (some pre-existing errors in `JsonCodeEditor.tsx` and `client-app-logic-providers.tsx` are unrelated and can be ignored)
7. (Optional) Hit `POST /api/send` as an admin with `{ template_id: "<kebab-name>", template_props: { ... }, to: "you@example.com", subject: "..." }` to verify end-to-end send via Resend

## Quick checklist

- [ ] `src/email-templates/<kebab-name>.tsx` — component + `PreviewProps`
- [ ] `src/lib/EmailTemplatesCatalog/email-template-refs/<Pascal>.ts` — catalog entry class
- [ ] `src/lib/EmailTemplatesCatalog/EmailTemplatesCatalog.ts` — one-line registration
- [ ] `src/app/api/admin/templates/preview/route.ts` — `sampleProps` entry
- [ ] `bun run dev:mail` preview renders
- [ ] `/admin/templates` iframe preview renders (no 400)
