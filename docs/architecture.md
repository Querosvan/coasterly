# Coasterly Architecture Notes

## Current Shape

The repository is split into four application surfaces and one shared package:

- `apps/web`: public-facing browser application
- `apps/api`: backend API for future business logic and integrations
- `apps/catalog-import`: short-lived Queue-Times catalog import job
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

### `apps/catalog-import`

- Run Queue-Times catalog import as a short-lived batch process
- Create or update Coasterly park and ride records from Queue-Times directory and queue data
- Maintain Queue-Times external mappings without turning import into a public API concern
- Exit cleanly so Railway can run it manually or on a schedule later

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

The current API bootstrap still seeds a Europe-heavy starter catalog directly in `apps/api/src/db.ts`, while the Queue-Times importer now provides the path to broader worldwide coverage.

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

The next catalog-depth foundation is separate from live waits:

- `apps/catalog-import` imports park and ride structure from Queue-Times
- Queue-Times is treated as an external catalog source, not the canonical Coasterly runtime model
- imported parks can now keep sparse metadata truthfully, including missing city values when Queue-Times does not provide them
- imported rides currently default to a generic `attraction` ride type unless richer Coasterly editorial data exists
- imported parks and rides now keep alias-ready search metadata so romanized, accented, or alternate names can be supported without changing the public browse API
- curated Queue-Times naming exceptions live in `apps/api/src/catalog-name-overrides.ts` so local-script or preferred display names can be added incrementally without rewriting the importer
- importer rollout can now be scoped by Queue-Times park IDs, continents, or countries for controlled worldwide expansion
- media is intentionally out of scope for this importer and should come from a separate media pipeline later

## User And Admin Foundations

Coasterly still uses a seeded demo user for the current public ride-credit and progress flows, but the underlying data model is now set up for real users later.

- `users` is no longer treated as a demo-only table
- the seeded user remains useful for development and preview environments
- `user_ride_credits` already works as a generic user-to-ride relationship

The current role foundation is intentionally lightweight:

- `user`
- `moderator`
- `regional_editor`
- `admin`
- `global_editor`
- `super_admin`

Roles are stored directly on the user record for now. That keeps the current foundation simple while giving future auth, admin, and editorial work a stable target. The root `super_admin` role is intended to remain server-controlled through trusted identity bootstrap, while `admin` is the highest app-managed role.

The API now also has a minimal current-user resolution layer:

- `/me` exposes the current resolved user
- provider identity can be linked through `auth_provider` + `auth_subject`
- if no identity is present, the API can still fall back to the seeded user for non-auth environments
- if identity is present but unmapped, the API fails rather than silently impersonating the fallback user

This makes future auth integration much cleaner because a later provider-specific middleware layer only needs to supply claims, not redesign the user model.

## Progression Foundations

Coasterly now has a lightweight user-progression layer built on top of the existing ride-credit data.

- progression is derived from `user_ride_credits` and park completion data
- the first version exposes badges and active missions through `/me/progression`
- `/demo-user/progression` remains available as a compatibility layer for non-auth and seeded-user flows
- no separate gamification tables were introduced yet, which keeps the first version easy to evolve while the product loop is still being validated

This gives the product a repeat-use foundation without committing too early to a larger achievement or seasonal-events system.

The next retention layer now adds a daily challenge foundation:

- `/me/daily-challenge` resolves a single daily question for the current user
- `/me/daily-challenge/answer` locks in one answer per UTC day and awards XP
- `/me/daily-challenge/reward` allows one daily reward claim and feeds the same XP summary
- the challenge generator can rotate across multiple small trivia templates without changing the rest of the flow
- the same seeded fallback behavior remains available through the current-user resolution path
- challenge state is intentionally small: one persisted attempt per user per day, plus derived XP and streak

The next profile layer now builds on top of that:

- `/me/profile` aggregates current-user stats, progression, and recent ride activity
- `/demo-user/profile` stays available as a seeded compatibility surface
- `/users/:slug/profile` exposes a lightweight public profile shape for sharing
- `/community/highlights` exposes a small public-activity feed for discovery surfaces
- profile and community responses now also expose a shared identity summary:
  - level
  - total XP
  - current streak
  - completed challenge days
- the web app can now treat current-user identity as a real product surface instead of only a hidden fallback behind credits and stats panels

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
