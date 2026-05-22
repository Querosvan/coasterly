# Pull Request Gates

Use these gates before opening a PR, marking a draft ready, or asking for final review.

## Branch And Scope

- Branch starts from updated `develop`.
- PR targets `develop`.
- Branch name is reviewable and task-specific.
- Scope matches the user story or task.
- No unrelated code, formatting churn, generated output, or local files are included.
- Documentation-only tasks do not change application code.

## Implementation Quality

- Existing patterns are followed before new abstractions are added.
- TypeScript contracts remain stable and explicit.
- `packages/types` stays narrow and runtime-light.
- Seeded fallback behavior is preserved unless explicitly changed.
- Queue-Times remains an enrichment or external source integration.
- No new dependencies, frameworks, cron jobs, or CI are added unless explicitly requested.

## Validation

- GitHub Actions runs the `Quality Gate` workflow on pull requests targeting `develop` and `main`.
- The workflow installs dependencies with `corepack pnpm install --frozen-lockfile`, then runs `corepack pnpm typecheck`, `corepack pnpm build`, and `corepack pnpm test`.
- Relevant typecheck/build commands were run.
- Tests were run when available and relevant.
- Missing lint/test scripts are stated honestly.
- Documentation-only changes received a manual formatting and readability check.
- Any validation blocker is explained in the PR.

## Architecture And Security

- Architecture review is complete when shared contracts, persistence, service boundaries, Queue-Times behavior, or Railway deployment are affected.
- Security review is complete when auth, current-user, admin, cookies, CORS, input handling, secrets, or external integrations are affected.
- Any accepted risk is documented.

## PR Description

The PR includes:

- what changed
- why it changed
- user or developer impact
- validation performed
- screenshots or preview links for visual changes when available
- Railway environment variable and deployment impact

## Ready-For-Merge Checklist

Before marking ready:

- acceptance criteria are met
- review comments are addressed
- validation is current after the latest commit
- the GitHub Actions quality gate has passed or any blocker is documented
- deployment impact is clear
- no unresolved blockers remain
