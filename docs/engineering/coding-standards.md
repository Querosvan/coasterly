# Coding Standards

These standards apply to Coasterly's current stack. Prefer existing project patterns over new abstractions.

## TypeScript

- Use TypeScript across apps and packages.
- Keep exported types explicit when they are shared across workspaces.
- Avoid `any` unless the boundary is genuinely unknown and narrowed immediately.
- Prefer small functions with clear input and output shapes.
- Keep runtime code out of `packages/types` unless there is a clear shared contract reason.
- Do not change API response shapes casually; frontend and future clients depend on them.

## React And Vite Web App

Applies to `apps/web`.

- Follow existing route and component structure.
- Keep public catalog flows fast, readable, and mobile-friendly.
- Prefer typed props and local helpers over broad global state.
- Show loading, empty, error, and unauthorized states when the user can encounter them.
- Keep Queue-Times attribution visible anywhere live wait data is surfaced.
- Use local media paths consistently when adding approved media:
  - `apps/web/public/media/parks/<slug>/cover.webp`
  - `apps/web/public/media/rides/<slug>/cover.webp`
- Do not add large media batches without a focused catalog/media task.
- Do not redesign login, admin, or moderation flows unless the task is specifically about those areas.

## Fastify API

Applies to `apps/api`.

- Keep route handlers typed and response shapes stable.
- Validate and constrain route params, query values, and request bodies before using them.
- Keep current-user resolution server-side.
- Enforce admin and editor permissions on the server, not through hidden frontend UI.
- Preserve seeded fallback behavior unless the task explicitly changes it.
- Return useful HTTP status codes for auth failures, permission failures, missing records, and upstream integration failures.
- Keep external provider details behind Coasterly endpoints; the frontend should not call Queue-Times directly.

## Shared Contracts

Applies to `packages/types`.

- Keep shared contracts narrow and runtime-light.
- Use this package for domain models and API request/response types that are truly shared.
- Avoid browser-only or Node-only dependencies.
- Keep names stable and descriptive so future web, API, import, cron, and mobile surfaces can reuse them.
- Do not use shared contracts as a dumping ground for implementation helpers.

## Railway-Oriented Deployment

- Treat Railway as the primary deployment target.
- Document environment variable changes in `docs/deployment.md` or the PR.
- Keep local `.env` assumptions out of code paths that must work in Railway.
- API services should bind to Railway-compatible host and port settings.
- Batch services should start, do their work, and exit cleanly.
- State deployment impact in every PR, even when the answer is "none".

## Local Media Handling

- Local public media belongs under `apps/web/public/media`.
- Use real, recognizable, rights-safe imagery or approved generated assets.
- Avoid abstract or misleading placeholders for public catalog covers.
- Check `docs/media-priority.md` before prioritizing media.
- Keep media changes focused and reviewable.

## Queue-Times Boundaries

Queue-Times is an enrichment and external source integration, not the canonical Coasterly data model.

- Keep Coasterly parks and rides as the source of truth.
- Use external source mappings for provider identifiers.
- Keep live wait responses normalized through the Coasterly API.
- Preserve attribution when Queue-Times data is shown.
- Do not add new cron jobs, historical wait-time storage, or broad ingestion behavior unless explicitly requested.
- Treat `apps/queue-times-cron` as existing infrastructure unless the task is specifically about it.
- Keep `apps/catalog-import` as a controlled import job, not a public API surface.

## Documentation

- Update docs when behavior, deployment, commands, environment variables, or workflow expectations change.
- Keep docs operational and specific to Coasterly.
- Do not add generic enterprise process.
- Mention missing lint or test scripts honestly.
