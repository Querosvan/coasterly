# Coasterly Codex Guidance

## Project Overview

Coasterly is a modern theme park and roller coaster tracking web app. It has a public catalog of parks and rides, local media assets, live Queue-Times enrichment, seeded fallback data, and early user/admin foundations. Login and admin UX can evolve later.

This repository is cloud-first and Railway-oriented. Prefer changes that are easy to review in a branch and validate through hosted preview or deployed environments.

## Repo Structure

- `apps/web`: React, Vite, and TypeScript web app.
- `apps/api`: Fastify and TypeScript API.
- `apps/catalog-import`: Queue-Times catalog import job.
- `apps/queue-times-cron`: existing Queue-Times batch/cron-related package. Treat it as existing infrastructure only; do not expand, schedule, persist historical waits, or build new ingestion behavior unless explicitly requested.
- `packages/types`: shared TypeScript types and API/domain contracts.
- `apps/web/public/media`: local public media assets for parks and rides.
- `docs`: architecture, deployment, media, admin, and Codex workflow documentation.

## Branch And Workflow Rules

- Gitflow is used.
- `main` is production-ready and protected.
- `develop` is the main integration branch and protected.
- Start all new work from an updated `develop`.
- Use branch names:
  - `feature/<short-description>`
  - `fix/<short-description>`
  - `release/<version>`
  - `hotfix/<short-description>`
- Never work directly on `main` or `develop`.
- If the current branch is `main` or `develop`, stop before editing and ask for or create a proper working branch.
- Every change should be merged through a pull request.
- Use Conventional Commits, for example `docs(repo): add codex guidance`.

Before editing, state the working branch. Keep changes small and reviewable.

## Commands

Use only commands that exist in the current package scripts.

Install dependencies:

```sh
pnpm install
```

Run all available development scripts:

```sh
pnpm dev
```

Build all workspaces that define `build`:

```sh
pnpm build
```

Typecheck all workspaces that define `typecheck`:

```sh
pnpm typecheck
```

Clean generated outputs for workspaces that define `clean`:

```sh
pnpm clean
```

Run app-specific scripts when scope matters:

```sh
pnpm --filter @coasterly/web dev
pnpm --filter @coasterly/web build
pnpm --filter @coasterly/web typecheck
pnpm --filter @coasterly/api dev
pnpm --filter @coasterly/api build
pnpm --filter @coasterly/api typecheck
pnpm --filter @coasterly/catalog-import build
pnpm --filter @coasterly/catalog-import typecheck
pnpm --filter @coasterly/queue-times-cron build
pnpm --filter @coasterly/queue-times-cron typecheck
```

Run all workspace tests that define a `test` script:

```sh
pnpm test
```

Run app-specific tests when scope matters:

```sh
pnpm --filter @coasterly/api test
```

There are currently no root or workspace `lint` scripts. Do not claim lint was run unless that script is added later or a task provides another explicit command.

## Coding Conventions

- Use TypeScript consistently.
- Keep shared contracts in `packages/types` narrow and runtime-light.
- Prefer existing helpers, types, routing patterns, and component structure before adding abstractions.
- Keep API responses stable and typed.
- Keep user/admin foundations server-controlled; do not add client-side role assignment paths.
- Preserve seeded fallback behavior unless the task explicitly asks to change it.
- Keep Queue-Times as an enrichment/source integration, not the canonical Coasterly data model.
- Do not add cron jobs, historical wait-time storage, or broad ingestion behavior unless explicitly requested.

## Product Principles

- Coasterly should feel useful for park discovery, ride tracking, and public catalog browsing.
- Prioritize accurate park and ride information over speculative content.
- Keep public catalog flows fast, readable, and mobile-friendly.
- Show Queue-Times attribution wherever live wait data is surfaced.
- Treat auth, admin editing, moderation, and advanced personalization as foundations that can evolve incrementally.

## Engineering Workflow Docs

- For larger tasks, use `docs/engineering/user-story-workflow.md` to move from idea intake to PR readiness.
- Use `docs/engineering/agent-roles.md` as practical review lenses for product, architecture, security, testing, implementation, code review, and PR delivery.
- Use `docs/engineering/pull-request-gates.md` before opening or marking a PR ready.

## Media And Image Rules

- Local public media belongs under `apps/web/public/media`.
- Use these target paths for covers:
  - `apps/web/public/media/parks/<slug>/cover.webp`
  - `apps/web/public/media/rides/<slug>/cover.webp`
- Prefer real, recognizable park and ride imagery with proper rights or project-approved generated assets.
- Avoid abstract, atmospheric, or misleading placeholders for public catalog covers.
- Do not add large media batches without a focused catalog/media task.
- Check `docs/media-priority.md` before adding or prioritizing media.

## Before Finishing Any Task

- Confirm the branch is not `main` or `develop`.
- Summarize changed files.
- Run the most relevant existing validation command, usually `pnpm typecheck` for code changes and `pnpm build` when behavior or bundling could be affected.
- Run `pnpm test` or a scoped workspace test command when tests exist for the affected area.
- If validation is not run, state why.
- Suggest a Conventional Commit message.
- Mention any Railway environment variables or deployment settings affected by the change.

## Do Not Do Unless Explicitly Requested

- Do not change application code during documentation-only tasks.
- Do not add new dependencies, frameworks, schedulers, or deployment platforms.
- Do not introduce plugin packaging for Codex workflow drafts.
- Do not add cron jobs or historical wait-time storage.
- Do not remove seeded fallback behavior.
- Do not redesign login, admin editing, or moderation flows unless the task is specifically about those areas.
- Do not commit, push, merge, or open a pull request unless asked.
