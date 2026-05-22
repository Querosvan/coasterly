# Codex Workflow Docs

This folder contains lightweight, copy/paste-friendly guidance for using Codex on Coasterly.

- `prompts/`: short reusable prompts for common work.
- `code_review.md`: review expectations for pull requests and local changes.
- `skills/`: draft `SKILL.md`-style workflows. These are plain docs only and are not packaged as Codex plugins.

Use these docs together with the root `AGENTS.md`.

## Engineering Workflow

Use the engineering docs when a task needs more structure than a single prompt:

- [`../engineering/user-story-workflow.md`](../engineering/user-story-workflow.md): flow from idea intake to ready-for-merge.
- [`../engineering/agent-roles.md`](../engineering/agent-roles.md): practical Codex review roles for product, architecture, security, testing, implementation, code review, and PR delivery.
- [`../engineering/coding-standards.md`](../engineering/coding-standards.md): repo-specific standards for TypeScript, React/Vite, Fastify, shared contracts, Railway, media, and Queue-Times boundaries.
- [`../engineering/testing-strategy.md`](../engineering/testing-strategy.md): current and target validation expectations.
- [`../engineering/security-review.md`](../engineering/security-review.md): practical security checklist for auth, admin, API, Railway, secrets, and Queue-Times work.
- [`../engineering/pull-request-gates.md`](../engineering/pull-request-gates.md): gates before opening or marking a PR ready.
