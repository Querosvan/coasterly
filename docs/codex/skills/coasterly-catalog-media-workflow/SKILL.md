# Coasterly Catalog And Media Workflow

## Description

Use this draft workflow when updating park/ride catalog content or local media references.

## Steps

1. Confirm the branch is not `main` or `develop`.
2. Read `docs/media-priority.md` and the relevant catalog/media code.
3. Keep catalog facts accurate and avoid speculative descriptions.
4. Use local cover paths only in these forms:
   - `apps/web/public/media/parks/<slug>/cover.webp`
   - `apps/web/public/media/rides/<slug>/cover.webp`
5. Prefer recognizable, rights-safe park and ride images.
6. Avoid large media batches unless the task requests a batch.
7. Preserve Queue-Times mappings and attribution behavior.
8. Run relevant existing validation for touched workspaces.

## Notes

This is a documentation draft only. It is not packaged as a Codex plugin or installed skill.
