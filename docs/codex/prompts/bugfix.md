# Bugfix Prompt

```text
Fix this Coasterly bug:

<bug description, expected behavior, actual behavior, reproduction steps>

Start by checking the branch and git status. Inspect the smallest relevant code path before editing. Prefer a narrow fix over a broad refactor.

Preserve seeded fallback behavior unless the bug is specifically about fallback. If Queue-Times live waits are involved, keep the integration server-side and preserve attribution in the UI.

Run the most relevant existing validation command and report anything that could not be verified.

When finished, summarize changed files, root cause, validation run, and a suggested Conventional Commit message.
```
