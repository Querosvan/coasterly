# Testing Strategy

This document describes the intended Coasterly testing direction. It does not add dependencies or CI by itself.

## Current State

Available root scripts:

- `pnpm dev`
- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm clean`

Available workspace validation is mostly TypeScript, build, and targeted unit-test based:

- `pnpm --filter @coasterly/web typecheck`
- `pnpm --filter @coasterly/web build`
- `pnpm --filter @coasterly/api typecheck`
- `pnpm --filter @coasterly/api build`
- `pnpm --filter @coasterly/api test`
- `pnpm --filter @coasterly/catalog-import typecheck`
- `pnpm --filter @coasterly/catalog-import build`
- `pnpm --filter @coasterly/queue-times-cron typecheck`
- `pnpm --filter @coasterly/queue-times-cron build`

There are currently no root or workspace `lint` scripts. Do not claim lint ran unless that script is added later or a task provides another explicit command.

The first real test baseline uses Vitest in `@coasterly/api` for deterministic pure TypeScript logic. The root `pnpm test` command runs all workspace tests that define a `test` script.

## Target State

Coasterly should grow toward a small, useful test pyramid:

- unit tests for shared logic, mappers, formatters, and contract helpers
- component tests for key public UI and admin review states
- API tests for Fastify routes, current-user behavior, role enforcement, and error responses
- job-level tests for Queue-Times catalog import and cron transformations where practical
- a few end-to-end checks for critical public flows once the deployment path is stable

Suggested tools to evaluate later:

- React Testing Library for component tests
- Fastify injection tests for API routes
- Playwright for high-value browser flows

Do not add these dependencies in documentation-only tasks.

## Expectations By Change Type

Documentation-only:

- manually check formatting, links, and readability
- no code validation required

Shared type or contract changes:

- run `pnpm typecheck`
- run affected app typechecks when root typecheck is too broad for the task
- add or update future tests when behavior depends on those contracts

Web UI changes:

- run `pnpm --filter @coasterly/web typecheck`
- run `pnpm --filter @coasterly/web build` when routing, assets, bundling, or environment variables are affected
- manually verify responsive behavior for user-facing pages when practical

API changes:

- run `pnpm --filter @coasterly/api typecheck`
- run `pnpm --filter @coasterly/api test` when pure API logic, service helpers, route behavior, progression, challenges, or user-facing API decisions are affected
- run `pnpm --filter @coasterly/api build` when deployment or runtime output is affected
- future API tests should cover success, missing data, invalid input, unauthenticated, and unauthorized paths

Catalog import changes:

- run `pnpm --filter @coasterly/catalog-import typecheck`
- run `pnpm --filter @coasterly/catalog-import build`
- use scoped Queue-Times import variables for manual runs when needed

Queue-Times cron changes:

- run `pnpm --filter @coasterly/queue-times-cron typecheck`
- run `pnpm --filter @coasterly/queue-times-cron build`
- verify the job still exits cleanly

Cross-workspace changes:

- run `pnpm typecheck`
- run `pnpm test`
- run `pnpm build` when runtime output, bundling, or deployment could be affected

Security-sensitive changes:

- run the relevant typecheck/build commands
- complete the security checklist in [security-review.md](./security-review.md)
- future tests should cover unauthorized and forbidden paths, not only successful requests

## Minimum Validation Before PR Ready

At minimum, every PR should include one of:

- relevant validation commands and their result
- a clear reason validation was not run

Documentation-only PRs can be ready with a manual readability check. Code PRs should not be marked ready without the most relevant existing typecheck, test, or build command unless there is a documented blocker.
