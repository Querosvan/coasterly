# Coasterly Railway Deployment Workflow

## Description

Use this draft workflow when changing Railway deployment documentation, service configuration, or environment variable guidance.

## Steps

1. Confirm the branch is not `main` or `develop`.
2. Read `docs/deployment.md`, affected `railway.json` files, package scripts, and `.env.example` files.
3. Treat Railway as the primary deployment platform.
4. Do not invent commands or environment variables.
5. Document affected Railway services and required variables when behavior changes.
6. Keep changes compatible with branch-based pull request validation.
7. Run relevant existing build/typecheck commands when code or service configuration changes.
8. Finish with changed files, Railway impact, validation, and a Conventional Commit suggestion.

## Notes

This is a documentation draft only. It is not packaged as a Codex plugin or installed skill.
