# Agent Roles

These roles describe how Codex should split thinking for Coasterly work. They are practical review lenses, not separate job titles or mandatory ceremony for every small change.

Use the smallest set of roles that reduces risk for the task.

## Product / User Story Analyst

Purpose: turn an idea into a scoped Coasterly user story or technical task.

When to use it:

- feature ideas
- UX changes
- catalog, ride tracking, profile, admin, or discovery changes
- ambiguous requests that need acceptance criteria before coding

Must check:

- target user and desired outcome
- acceptance criteria
- scope and out-of-scope items
- public catalog usefulness and mobile readability
- Queue-Times attribution needs when live waits are shown

Must not do:

- implement code
- add dependencies or CI
- expand scope into unrelated roadmap work
- invent product claims or park/ride data

Expected output: a user story, acceptance criteria, scope, and open questions or assumptions.

## Architecture Reviewer

Purpose: verify that the proposed implementation fits Coasterly's current architecture.

When to use it:

- shared type changes
- API contract changes
- persistence or seed data changes
- Queue-Times import, live wait, or mapping changes
- Railway deployment changes
- changes crossing multiple workspaces

Must check:

- correct workspace ownership
- stable typed API responses
- narrow `packages/types` contracts
- seeded fallback preservation
- Queue-Times boundaries
- Railway service and environment impact

Must not do:

- redesign unrelated modules
- introduce framework sprawl
- turn Queue-Times into the canonical Coasterly model
- add cron or historical wait behavior unless explicitly requested

Expected output: approved approach, risks, affected modules, and any required docs updates.

## Security Reviewer

Purpose: catch practical security issues before they ship.

When to use it:

- auth, sessions, cookies, or CORS
- `/me` or current-user behavior
- admin routes and role checks
- user-generated content
- API input handling
- Railway variables or secrets
- external integrations

Must check:

- server-side role enforcement
- no client-side role assignment
- secrets stay out of code and docs examples
- CORS and cookie behavior matches deployment
- inputs are validated or constrained
- external Queue-Times failures are handled safely

Must not do:

- add broad security frameworks without scope
- weaken seeded fallback safeguards
- expose operational secrets
- approve admin behavior based only on hidden UI

Expected output: checklist result, blocking risks, and recommended fixes.

## Test Engineer

Purpose: define the validation needed for the change.

When to use it:

- behavior changes
- shared logic changes
- API route changes
- UI workflow changes
- fixes for regressions

Must check:

- relevant existing scripts
- whether typecheck/build are enough for this task
- missing unit, component, or API test coverage
- manual checks needed for UI or deployment
- edge cases from the acceptance criteria

Must not do:

- claim lint or test scripts exist when they do not
- add dependencies in a docs-only task
- require heavyweight testing for a tiny documentation change

Expected output: validation plan and final validation summary.

## Implementation Agent

Purpose: make the focused change.

When to use it:

- after the story or task has clear scope
- after required architecture or security concerns are understood

Must check:

- current branch is not `main` or `develop`
- existing patterns before adding abstractions
- TypeScript correctness
- stable API and shared contracts
- no unrelated changes
- docs updated when behavior or deployment changes

Must not do:

- commit, push, or open a PR unless asked
- edit application code in documentation-only tasks
- add dependencies, schedulers, or deployment platforms without explicit request
- remove seeded fallback behavior

Expected output: focused diff, validation result, changed files, and suggested Conventional Commit.

## Code Reviewer

Purpose: review code or docs for defects, regressions, and missing validation.

When to use it:

- before PR creation
- when asked for a review
- after implementation touches shared or risky behavior

Must check:

- correctness against acceptance criteria
- behavior regressions
- missing type coverage or tests
- security and role enforcement concerns
- deployment and environment impact
- docs accuracy

Must not do:

- rewrite the change without cause
- focus on style preferences over defects
- expand the PR scope
- approve claims that were not validated

Expected output: findings ordered by severity, file references when applicable, open questions, and residual risk.

## PR Delivery Reviewer

Purpose: verify the PR is ready for review or merge.

When to use it:

- right before opening a PR
- before marking a draft PR ready
- after review comments are addressed

Must check:

- branch is from updated `develop`
- PR targets `develop`
- scope is focused
- validation is recorded
- architecture/security reviews are noted when relevant
- deployment impact is stated
- no unrelated changes are staged or committed

Must not do:

- merge the PR
- mark ready if validation or review gates are missing
- hide known risks

Expected output: PR readiness checklist, remaining blockers, and final PR summary.
