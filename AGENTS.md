# Coasterly Agent Rules

## Delivery model
This repository is cloud-first.

- Do not treat local development as the primary workflow.
- Prefer changes that are easy to validate through hosted preview or deployed environments.
- Keep repository updates focused on branch-based collaboration, pull requests, and deployment readiness.

## Branching workflow
This repository follows Gitflow.

- `main` is always production-ready and protected.
- `develop` is the main integration branch and protected.
- All new work must start from `develop`.
- Use branch names:
  - `feature/<short-description>`
  - `fix/<short-description>`
  - `release/<version>`
  - `hotfix/<short-description>`
- Every feature or fix must happen on its own branch.
- Every branch must be merged through a pull request.

## Direct push policy
- Never work directly on `main`.
- Never work directly on `develop`.
- If the current branch is `main` or `develop`, stop and tell the user to create or switch to a proper working branch before making changes.

## Commit policy
This repository uses Conventional Commits.

Use commit messages in this format:
- `feat(scope): description`
- `fix(scope): description`
- `docs(scope): description`
- `refactor(scope): description`
- `test(scope): description`
- `build(scope): description`
- `ci(scope): description`
- `chore(scope): description`

Examples:
- `feat(api): add parks health endpoint`
- `fix(web): correct router base path`
- `docs(repo): document branching strategy`

## Working style
- Before making changes, state the branch you expect to work on.
- If a branch is missing, propose the exact branch name to create.
- Keep changes small and reviewable.
- Do not introduce unnecessary complexity.
- Prefer simple, production-friendly solutions.
- When workflow or infrastructure guidance is added, document the cloud provider and required environment variables explicitly.

## Safety checks
Before finishing a task:
- confirm the branch is not `main`
- summarize changed files
- suggest a Conventional Commit message
