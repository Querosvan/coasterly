# Coasterly Feature Workflow

## Description

Use this draft workflow when implementing a small Coasterly feature in the web app, API, or shared types.

## Steps

1. Confirm the current branch is not `main` or `develop`.
2. Check `git status --short` and avoid overwriting unrelated work.
3. Inspect the relevant files before editing.
4. Keep changes scoped to the feature.
5. Update `packages/types` only when a shared contract changes.
6. Preserve seeded fallback behavior unless the feature explicitly changes it.
7. Avoid new dependencies, cron jobs, and historical wait-time storage unless requested.
8. Run the relevant existing validation command:
   - `pnpm --filter @coasterly/web typecheck`
   - `pnpm --filter @coasterly/api typecheck`
   - `pnpm typecheck`
   - `pnpm build`
9. Finish with changed files, validation, Railway/env impact, and a Conventional Commit suggestion.

## Notes

This is a documentation draft only. It is not packaged as a Codex plugin or installed skill.
