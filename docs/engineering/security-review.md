# Security Review

Use this checklist for changes that touch auth, current-user resolution, admin behavior, input handling, cookies, CORS, Railway variables, secrets, or external integrations.

## Auth And Current User

- Current-user resolution stays server-side.
- `/me` behavior does not silently impersonate the seeded user when trusted identity claims are present but unmapped.
- Seeded fallback remains intentional and controlled by environment.
- User identity fields such as provider and subject are not trusted from arbitrary client input unless a trusted middleware or provider layer supplies them.
- Auth failure responses do not leak sensitive identity details.

## Admin And Role Enforcement

- Admin and editor permissions are enforced by the API.
- Hidden UI is treated only as a convenience, not as access control.
- Role changes are not accepted from client-side paths.
- `super_admin` remains server-controlled through trusted bootstrap configuration.
- New admin endpoints return `401` for unauthenticated users and `403` for authenticated users without permission.
- Future regional or moderation scopes are not implied unless actually enforced.

## Cookies And CORS

- Cookie secrets come from Railway environment variables, not source code.
- Cookies use deployment-appropriate security settings.
- CORS origins are explicit and environment-specific.
- Preview and production origins are handled deliberately.
- Auth callbacks return users to approved web origins only.

## API Input Validation

- Route params and query values are constrained before use.
- Request bodies are validated or narrowed before persistence.
- Slugs, IDs, pagination, filters, and dates have predictable bounds.
- Invalid input returns a controlled error response.
- Database queries remain parameterized.

## User-Generated Content

Future user-generated content includes comments, profile fields, lists, submitted media, and moderation notes.

- Store only fields the product needs.
- Escape or sanitize content before rendering.
- Do not trust client-side moderation state.
- Keep moderation actions auditable when write tooling is introduced.
- Avoid exposing private user data through public profile or community endpoints.

## Public Catalog Data

- Public catalog endpoints should expose only intended park, ride, media, and live wait fields.
- Do not leak admin-only status, review notes, source-mapping internals, or operational metadata unless the endpoint is explicitly admin-only.
- Prefer accurate missing data over speculative values.
- Keep public media rights-safe and recognizable.

## Railway Environment Variables

- Document new variables in `docs/deployment.md`.
- Keep production, develop, and preview values separated.
- Do not require local-only variables for deployed behavior.
- State whether a PR changes Railway configuration.
- Keep `COASTERLY_ENABLE_SEEDED_FALLBACK=false` in production unless there is a deliberate temporary exception.

## Secrets

- Never commit secrets, tokens, OAuth client secrets, session secrets, database URLs, or private API keys.
- Do not paste real secrets into docs, PRs, screenshots, or logs.
- Use placeholder examples when documentation needs a variable shape.
- Rotate secrets if exposure is suspected.

## Queue-Times External Integration

- Queue-Times requests are made server-side or from controlled job services.
- Upstream failures should not crash public catalog browsing.
- Live wait data remains an enrichment layer with attribution.
- Provider IDs stay in external source mappings rather than becoming canonical park or ride IDs.
- Do not add new cron jobs, historical wait-time storage, or broad ingestion behavior without explicit scope and review.

## Security Review Output

For relevant PRs, record:

- whether this checklist was completed
- any blocking risks
- accepted residual risks
- validation commands or manual checks used
- Railway variable or secret changes
