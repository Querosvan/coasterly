# Coasterly Architecture Notes

## Current Shape

The repository is split into three application surfaces and one shared package:

- `apps/web`: public-facing browser application
- `apps/api`: backend API for future business logic and integrations
- `apps/queue-times-cron`: scheduled Queue-Times snapshot ingestion job
- `packages/types`: shared contracts used across clients and services

## Design Principles

### 1. Keep shared code narrow

Only types are shared right now. This reduces coupling and keeps each app free to evolve on its own.

### 2. Stay mobile-ready

When a mobile app is added later, it should fit naturally as:

```text
apps/
  mobile/
```

That mobile app should be able to reuse `packages/types` without pulling in browser-only or Node-only code.

### 3. Avoid framework sprawl

The starter does not include extra orchestration tools or platform abstractions yet. Those can be introduced later if the repository actually needs them.

## Initial Responsibilities

### `apps/web`

- Render the first browser experience
- Consume the backend API later
- Stay focused on UI concerns

### `apps/api`

- Expose HTTP endpoints
- Hold business logic as the platform grows
- Become the integration layer for databases and external services later

### `apps/queue-times-cron`

- Run scheduled Queue-Times ingestion as a short-lived batch process
- Reuse the API-side ingestion foundations without keeping an HTTP server alive
- Exit cleanly so Railway Cron Jobs can schedule the next run

### `packages/types`

- Define request and response shapes
- Provide shared domain models
- Remain runtime-light for reuse across platforms

## Suggested Growth Path

As Coasterly expands, add complexity only when it solves a real problem:

1. Add domain models and API contracts to `packages/types`
2. Introduce persistence in `apps/api`
3. Add tests when behavior becomes meaningful enough to protect
4. Add `apps/mobile` when the product is ready for native experiences
5. Add deployment and CI once the repository needs release automation

## Current Catalog Foundations

The current API bootstrap now seeds a broader European park and ride catalog directly in `apps/api/src/db.ts`.

- Parks and rides remain PostgreSQL-backed and are inserted or updated on startup
- Demo-user park progress is derived from `user_ride_credits`, not stored as a separate table
- Park progress uses:
  - total rides
  - ridden rides
  - completion percentage

This keeps the first progress model small and avoids denormalized state.

## Seeded Media Approach

Park and ride records now support optional `image_url` fields in PostgreSQL.

- Media is stored as remote image URLs, not repo-hosted binary assets
- The seeded catalog currently uses deterministic `placehold.co` image URLs
- This avoids introducing copyrighted assets or an upload pipeline in the current phase
- The placeholder URLs already follow the intended Coasterly brand direction with dark navy and vivid orange tones

This is intentionally a foundation step. A later phase can replace seeded placeholder URLs with curated licensed imagery or a managed media pipeline without changing the domain model again.

## External Source Foundations

Coasterly keeps its own `parks` and `rides` tables as the catalog source of truth.

- External providers are attached through `external_source_mappings`
- The first source is Queue-Times, but the schema is generic enough for more providers later
- Queue-Times identifiers are not hardcoded into `parks` or `rides`
- This keeps a future admin/backoffice path straightforward: mappings can be edited without changing the core catalog schema

Live queue data is handled as an enrichment layer:

- the API fetches Queue-Times data server-side
- the frontend only talks to Coasterly endpoints
- normalized live wait responses stay under Coasterly control
- `wait_time_snapshots` stores the minimal history foundation needed for future trend and historical features

The initial ingestion path is intentionally small. The codebase now has a dedicated `apps/queue-times-cron` batch service that can run in Railway Cron Jobs and persist snapshots without turning the API into a scheduler.

## User And Admin Foundations

Coasterly still uses a seeded demo user for the current public ride-credit and progress flows, but the underlying data model is now set up for real users later.

- `users` is no longer treated as a demo-only table
- the seeded user remains useful for development and preview environments
- `user_ride_credits` already works as a generic user-to-ride relationship

The current role foundation is intentionally lightweight:

- `user`
- `moderator`
- `regional_editor`
- `global_editor`
- `super_admin`

Roles are stored directly on the user record for now. That keeps the current foundation simple while giving future auth, admin, and editorial work a stable target.

The intended future backoffice editing areas are:

- parks
- rides
- media
- external source mappings
- discovery metadata
- summaries
- featured and curated flags

Regional ownership and moderation workflows are intentionally left for a later phase. Those should be added as scoped assignment or workflow tables instead of baking regional complexity straight into the base user record.

For more detail, see [docs/admin-foundations.md](./admin-foundations.md).
