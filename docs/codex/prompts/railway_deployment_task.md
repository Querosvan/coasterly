# Railway/Deployment Task Prompt

```text
Handle this Coasterly Railway/deployment task:

<deployment issue or change>

Before editing, inspect docs/deployment.md, railway.json files, package scripts, and .env.example files for affected services. Use Railway as the primary deployment target.

Do not invent commands or environment variables. If deployment behavior changes, document the affected Railway service and required variables.

Keep branch-based PR validation in mind. Do not add another deployment platform unless explicitly requested.

Run the relevant existing build/typecheck command for affected workspaces if code or service configuration changed.

When finished, summarize changed files, Railway impact, validation run, and a suggested Conventional Commit message.
```
