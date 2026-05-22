# User Story Workflow

Use this flow when starting a meaningful Coasterly change. Keep it lightweight: the goal is to make the work clear enough to build, review, and deploy safely.

## 1. Idea Intake

Capture the product idea in plain language:

- what user or operator problem it solves
- where it appears in Coasterly, such as public catalog, ride tracking, admin review, API, import, or deployment
- why it matters now
- known constraints, data sources, and Railway environment impact

Do not start implementation from a vague idea. First turn it into a scoped user story or a clear technical task.

## 2. User Story Definition

Write the story in this shape when product behavior changes:

```text
As a <user type>,
I want <capability>,
so that <outcome>.
```

Use concrete Coasterly user types such as park visitor, coaster enthusiast, catalog browser, signed-in user, moderator, editor, admin, or operator.

For non-product work, define the engineering outcome instead:

```text
Improve <area> so that <engineering or deployment outcome>.
```

## 3. Acceptance Criteria

List observable requirements that a reviewer can verify. Good criteria mention:

- route, screen, endpoint, job, or package affected
- expected success behavior
- expected empty, loading, error, or unauthorized behavior
- data source behavior, including seeded fallback and Queue-Times attribution when relevant
- mobile or responsive expectations for public web UI
- Railway variables or service settings if deployment changes

Avoid acceptance criteria that only say "works correctly".

## 4. Scope And Out Of Scope

State what is included and excluded before implementation.

Common out-of-scope items unless explicitly requested:

- new dependencies
- cron jobs or scheduling changes
- historical wait-time storage
- broad Queue-Times ingestion behavior
- auth or admin redesigns
- role assignment from the client
- large media batches
- unrelated visual redesigns

## 5. Architecture Review

Run an architecture review before implementation when the story changes shared contracts, persistence, service boundaries, Queue-Times behavior, auth/current-user behavior, admin foundations, or Railway deployment.

Check:

- whether the change belongs in `apps/web`, `apps/api`, `apps/catalog-import`, `apps/queue-times-cron`, or `packages/types`
- whether `packages/types` stays narrow and runtime-light
- whether API response shapes remain stable and typed
- whether seeded fallback behavior is preserved
- whether Queue-Times remains an enrichment or external source mapping, not the canonical Coasterly model
- whether deployment settings are documented instead of hidden in local-only assumptions

Expected output: a short note with approved approach, risks, and files or modules expected to change.

## 6. Security Review

Run a security review when a story touches auth, current-user resolution, sessions, cookies, CORS, admin routes, roles, input from users, external integrations, secrets, or Railway variables.

Use [security-review.md](./security-review.md). If not relevant, say why in the task or PR.

## 7. Testing Plan

Before coding, choose the validation level.

- Documentation-only: manual readability check is enough.
- Type-only or shared contract changes: run `pnpm typecheck`.
- Web UI changes: run `pnpm --filter @coasterly/web typecheck`; run `pnpm --filter @coasterly/web build` when routing, bundling, assets, or environment variables are affected.
- API changes: run `pnpm --filter @coasterly/api typecheck`; run `pnpm --filter @coasterly/api test` when pure API logic, service helpers, or route behavior is affected; run build when runtime output or deployment could be affected.
- Batch job changes: run the relevant package typecheck and build.
- Cross-workspace changes: prefer root `pnpm typecheck`, `pnpm test`, and `pnpm build`.

There are currently no root or workspace `lint` scripts. Do not claim lint ran unless that script is added later or the task provides another command.

## 8. Implementation

Implement in a focused branch from updated `develop`.

Keep changes small and reviewable:

- follow existing routing, component, API, and type patterns
- avoid speculative abstractions
- update docs when behavior or deployment changes
- avoid unrelated formatting churn
- do not change application code during documentation-only tasks

## 9. Self-Review

Before opening a PR, review your own diff.

Check:

- no unrelated files changed
- no generated outputs were committed unless intentionally required
- acceptance criteria are covered
- seeded fallback and Queue-Times boundaries still hold
- user/admin permissions remain server-controlled
- validation output is known
- Railway variable or deployment impact is stated

## 10. PR Creation

Open a PR into `develop`.

The PR should include:

- concise summary
- user or developer impact
- validation commands run, or a clear reason validation was not run
- security review result when relevant
- architecture review result when relevant
- deployment and Railway environment impact
- screenshots or preview links for visual changes when available

## 11. Final Review

Use review roles as needed from [agent-roles.md](./agent-roles.md). The reviewer should focus on correctness, regressions, missing validation, security, and deployment risk.

Do not use final review to expand scope. New ideas should become follow-up issues or PRs.

## 12. Ready-For-Merge Checklist

Before marking ready:

- branch was created from updated `develop`
- scope is focused and matches the story
- no unrelated changes are included
- acceptance criteria are met
- architecture review is complete when relevant
- security review is complete when relevant
- typecheck/build ran where relevant
- tests ran if available and relevant
- PR summary and validation are included
- Railway environment or deployment impact is documented
- unresolved review comments are addressed
