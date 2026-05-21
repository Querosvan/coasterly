# API Endpoint Task Prompt

```text
Implement or update this Coasterly API endpoint:

<endpoint behavior and response shape>

Before editing, inspect apps/api routes/services and packages/types. Keep response contracts typed and update shared types when the web app or other packages consume the shape.

Preserve current-user resolution and seeded fallback semantics unless the task explicitly changes auth behavior. Keep Queue-Times calls server-side through the API.

Do not add cron jobs, historical wait-time storage, or broad ingestion behavior unless requested.

Run pnpm --filter @coasterly/api typecheck and pnpm typecheck if shared types changed. Run pnpm --filter @coasterly/api build when runtime output could be affected.

When finished, summarize changed files, endpoint behavior, validation run, Railway/env impacts, and a suggested Conventional Commit message.
```
