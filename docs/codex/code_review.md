# Coasterly Code Review Expectations

Use this when asking Codex to review a branch, pull request, or local diff.

## Review Priorities

1. Correctness bugs and user-visible regressions.
2. API contract, type, and data-shape mismatches.
3. Railway deployment or environment variable risks.
4. Queue-Times integration issues, including missing attribution.
5. Catalog/media accuracy issues.
6. Security issues in auth, roles, cookies, CORS, and admin surfaces.
7. Missing validation for changed behavior.

## Review Style

- Lead with findings, ordered by severity.
- Include file and line references when possible.
- Explain impact and the smallest practical fix.
- Keep summaries brief and secondary.
- If no issues are found, say so and call out remaining test or validation gaps.

## Coasterly-Specific Checks

- Branch is not `main` or `develop`.
- Shared types in `packages/types` still match API and web usage.
- Public catalog flows still work with seeded fallback data.
- Live waits remain server-side through Coasterly API endpoints.
- Queue-Times attribution remains visible where live waits are displayed.
- No new cron jobs or historical wait-time storage were added unless requested.
- Media paths follow `apps/web/public/media/parks/<slug>/cover.webp` or `apps/web/public/media/rides/<slug>/cover.webp`.
- Admin-only behavior stays server-enforced.
- Railway variables are documented when deployment behavior changes.

## Suggested Prompt

```text
Review the current Coasterly changes as a code reviewer. Focus on correctness, API/type contracts, Railway deployment risk, Queue-Times behavior, media/catalog accuracy, and missing validation. Lead with findings by severity and include file/line references where possible. If there are no findings, say that clearly and mention remaining validation gaps.
```
