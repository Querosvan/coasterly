# Feature Implementation Prompt

```text
Implement this Coasterly feature:

<feature description>

Before editing, inspect the current branch and confirm it is not main or develop. Read the relevant app/package files first. Keep the change small and consistent with existing patterns.

Use existing scripts only. For code changes, run the most relevant available validation command, usually pnpm typecheck and pnpm build if bundling or runtime behavior changed.

Do not add new dependencies, cron jobs, historical wait-time storage, or deployment platforms unless explicitly needed for this feature.

When finished, summarize changed files, validation run, Railway/env impacts, and a suggested Conventional Commit message.
```
