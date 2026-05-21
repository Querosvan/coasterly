# Coasterly Review Workflow

## Description

Use this draft workflow when reviewing Coasterly code changes.

## Steps

1. Identify the branch, base branch, and changed files.
2. Read the diff before running broad searches.
3. Prioritize correctness, user-visible regressions, API/type contracts, auth/admin safety, Queue-Times behavior, Railway risk, and media/catalog accuracy.
4. Check whether validation was run or should be run.
5. Lead the response with findings ordered by severity.
6. Include file and line references where possible.
7. If no issues are found, say so and list residual validation gaps.

## Notes

This is a documentation draft only. It is not packaged as a Codex plugin or installed skill.
