# Coasterly Architecture Notes

## Current Shape

The repository is split into two application surfaces and one shared package:

- `apps/web`: public-facing browser application
- `apps/api`: backend API for future business logic and integrations
- `packages/types`: shared contracts used across clients and services

## Design Principles

### 1. Keep shared code narrow

Only types are shared right now. This reduces coupling and keeps each app free to evolve on its own.

### 2. Stay mobile-ready

When a mobile app is added later, it should fit naturally as:

```text
apps/
  mobile/
```

That mobile app should be able to reuse `packages/types` without pulling in browser-only or Node-only code.

### 3. Avoid framework sprawl

The starter does not include extra orchestration tools or platform abstractions yet. Those can be introduced later if the repository actually needs them.

## Initial Responsibilities

### `apps/web`

- Render the first browser experience
- Consume the backend API later
- Stay focused on UI concerns

### `apps/api`

- Expose HTTP endpoints
- Hold business logic as the platform grows
- Become the integration layer for databases and external services later

### `packages/types`

- Define request and response shapes
- Provide shared domain models
- Remain runtime-light for reuse across platforms

## Suggested Growth Path

As Coasterly expands, add complexity only when it solves a real problem:

1. Add domain models and API contracts to `packages/types`
2. Introduce persistence in `apps/api`
3. Add tests when behavior becomes meaningful enough to protect
4. Add `apps/mobile` when the product is ready for native experiences
5. Add deployment and CI once the repository needs release automation
