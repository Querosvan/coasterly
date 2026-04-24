# Coasterly

Coasterly is starting as a simple TypeScript monorepo for a community-driven theme park and coaster tracking platform.

This repository currently includes only the foundation:

- a web app
- a backend API
- a Queue-Times cron app
- a shared types package
- lightweight documentation

The goal is to keep the setup production-friendly without adding extra complexity too early.

## Repository Layout

```text
coasterly/
  apps/
    api/            Fastify API
    queue-times-cron Scheduled Queue-Times snapshot ingestion job
    web/            React + Vite web app
  docs/
    architecture.md Project structure and growth path
  packages/
    types/          Shared TypeScript types
  package.json      Root workspace scripts
  pnpm-workspace.yaml
  tsconfig.base.json
```

## Why This Structure

- `apps/web` keeps the browser app isolated from backend concerns.
- `apps/api` gives the platform a dedicated backend from day one.
- `apps/queue-times-cron` keeps scheduled Queue-Times ingestion separate from the always-on API process.
- `packages/types` is intentionally type-only for now, so it can be safely shared by web, API, and a future mobile app.
- The monorepo is ready for an eventual `apps/mobile` directory without a reorganization later.

## Tech Choices

- Package manager: `pnpm`
- Language: `TypeScript`
- Web app: `React` + `Vite`
- API: `Fastify`
- Shared package: TypeScript-only types

These choices keep local development straightforward while still being suitable for a production codebase.

## Getting Started

1. Install Node.js 20 or newer.
2. Enable or install `pnpm`.
3. Install dependencies from the repo root:

```bash
pnpm install
```

4. Start everything:

```bash
pnpm dev
```

Or run each app separately:

```bash
pnpm --filter @coasterly/api dev
pnpm --filter @coasterly/queue-times-cron dev
pnpm --filter @coasterly/web dev
```

## Workspace Scripts

- `pnpm dev`: runs all available workspace dev scripts in parallel
- `pnpm build`: builds every workspace that has a build script
- `pnpm typecheck`: runs TypeScript checks across the repo
- `pnpm clean`: removes generated build output where applicable

## Frontend Media

The web app can use manual local PNG assets without code changes.

- Park covers: `apps/web/public/media/parks/<park-slug>/cover.png`
- Ride covers: `apps/web/public/media/rides/<ride-slug>/cover.png`

If a local file exists for the slug, the frontend can use it automatically. If not, it falls
back gracefully to API media or a lightweight built-in fallback.

## Current Starter Scope

The starter intentionally does not include authentication, databases, design systems, testing frameworks, CI, or deployment configuration yet.

That keeps the foundation easy to understand while still leaving room to grow into:

- coaster tracking
- park discovery
- user profiles
- community features
- mobile applications

For more detail, see [docs/architecture.md](./docs/architecture.md).

Deployment planning lives in [docs/deployment.md](./docs/deployment.md).

User and role foundations are outlined in [docs/admin-foundations.md](./docs/admin-foundations.md).

The API now also has a minimal current-user foundation through `/me`, with a seeded-user fallback for non-auth environments.
