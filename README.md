# Coasterly

Coasterly is starting as a simple TypeScript monorepo for a community-driven theme park and coaster tracking platform.

This repository currently includes only the foundation:

- a web app
- a backend API
- a shared types package
- lightweight documentation

The goal is to keep the setup production-friendly without adding extra complexity too early.

## Repository Layout

```text
coasterly/
  apps/
    api/            Fastify API
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
pnpm --filter @coasterly/web dev
```

## Workspace Scripts

- `pnpm dev`: runs all available workspace dev scripts in parallel
- `pnpm build`: builds every workspace that has a build script
- `pnpm typecheck`: runs TypeScript checks across the repo
- `pnpm clean`: removes generated build output where applicable

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
