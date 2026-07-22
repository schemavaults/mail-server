---
name: nextjs-docs
description: Use when you need Next.js documentation — App Router conventions, next.config options, caching/rendering semantics, route handlers, middleware, metadata, built-in components (Image/Link/Script/Form), functions (cookies, headers, redirect, useRouter), CLI flags, or upgrade/deprecation questions. The installed next package ships its own docs, so consult them instead of web searches or memory: they exactly match the version this project runs.
---

# Next.js documentation (version-matched, offline)

The `next` package bundles the complete official documentation for **the exact
installed version** at:

```
./node_modules/next/dist/docs/
```

Always prefer these files over recalling Next.js behavior from memory or
searching the web — APIs, defaults, and caching semantics change between
majors, and these docs cannot drift from the version in `package.json`
(check the installed version with `bun pm ls next` or in `bun.lock`).

## Layout

Files are Markdown with numeric ordering prefixes (`01-`, `02-`, …); every
directory has an `index.md` overview.

- `01-app/` — **App Router (this project uses the App Router — look here first)**
  - `01-getting-started/` — project structure, layouts/pages, data fetching, caching overview
  - `02-guides/` — task-oriented guides (auth, caching, ISR, environment variables, migrating, upgrading, …)
  - `03-api-reference/`
    - `01-directives/` — `use client`, `use server`, `use cache`
    - `02-components/` — `<Image>`, `<Link>`, `<Script>`, `<Form>`, fonts
    - `03-file-conventions/` — `layout.tsx`, `page.tsx`, `route.ts`, `error.tsx`, `middleware`, metadata files, route-segment config
    - `04-functions/` — `cookies`, `headers`, `redirect`, `revalidatePath`, `useRouter`, `generateMetadata`, `connection`, …
    - `05-config/01-next-config-js/` — `next.config.js` options (one file per option); TypeScript & ESLint config alongside in `05-config/`
    - `06-cli/` — `next dev`, `next build`, flags
- `02-pages/` — Pages Router (not used by this project; only consult when a dependency or migration question involves it)
- `03-architecture/` — Fast Refresh, the Next.js compiler, supported browsers, accessibility
- `04-community/` — contribution guide, Rspack

## How to find things

- Known topic → jump straight to the file, e.g.:
  - `Glob node_modules/next/dist/docs/01-app/03-api-reference/**/use-router.md`
  - `next.config` option `serverExternalPackages` → `01-app/03-api-reference/05-config/01-next-config-js/serverExternalPackages.md`
- Unsure where it lives → Grep the tree, e.g.
  `Grep pattern:"revalidatePath" path:"node_modules/next/dist/docs" -l`
- Behavior/semantics questions ("when is a route static?", "what does
  `dynamic = 'force-dynamic'` do?") → `01-app/01-getting-started/` and
  `03-file-conventions/02-route-segment-config/`
- Upgrade or deprecation questions → `01-app/02-guides/` (upgrading/migrating
  guides) before proposing codemods from memory

Cite the doc file path (e.g.
`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`)
when your answer leans on it, so claims are checkable against the installed
version.
