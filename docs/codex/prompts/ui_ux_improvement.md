# UI/UX Improvement Prompt

```text
Improve this Coasterly UI/UX area:

<page/component/workflow and desired outcome>

Before editing, inspect the current component structure, styles, routing, and nearby UI patterns. Keep the experience mobile-friendly, catalog-focused, and practical for park discovery or ride tracking.

Do not turn app screens into marketing pages. Do not add new dependencies unless requested. Use local media paths only when suitable assets already exist or the task explicitly includes media work.

Run pnpm --filter @coasterly/web typecheck and pnpm --filter @coasterly/web build if the web app changed.

When finished, summarize changed files, UX behavior changed, validation run, and a suggested Conventional Commit message.
```
