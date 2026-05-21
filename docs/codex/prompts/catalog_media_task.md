# Catalog/Media Task Prompt

```text
Handle this Coasterly catalog/media task:

<parks/rides/media changes needed>

Before editing, inspect docs/media-priority.md, existing catalog data, and existing media references. Keep catalog facts accurate and avoid speculative details.

Use media paths:
- apps/web/public/media/parks/<slug>/cover.webp
- apps/web/public/media/rides/<slug>/cover.webp

Do not add large media batches, abstract placeholders, copyrighted assets, or a media pipeline unless explicitly requested. Preserve Queue-Times mappings and seeded fallback behavior.

Run the relevant existing validation command for touched workspaces.

When finished, summarize changed files, catalog/media coverage, validation run, and a suggested Conventional Commit message.
```
