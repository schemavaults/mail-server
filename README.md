# @schemavaults/mail-server

## Welcome 👋

This is an application that manages mailing lists and e-mail templates. Allows sending transactional mail or marketing mail via the [`@schemavaults/send-email`](https://github.com/schemavaults/send-email) package.

## Install Dependencies

To install dependencies:

```bash
bun install
```

## Required Environment Variables

See the [.env.example](./.env.example) file for required environment variables.

## Development

```bash
bun run dev
```

## Build App

```bash
bun run build
```

## Database Migrations

### Build Migrations
```bash
bun run build:migrations
```

### Apply Migrations

Add database credentials to .env.production and run:
```bash
bun run migrate:production
```
