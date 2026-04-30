# Deployment Plan

This repository is set up for a cloud-first workflow with Railway as the primary deployment platform.

- `main` is production
- `develop` is integration
- `feature/*`, `fix/*`, `release/*`, and `hotfix/*` branches flow through pull requests
- local development is optional, not the primary path for validation
- Vercel can remain active during the migration, but new deployment setup should target Railway first

## Platform Mapping

### Web

- Platform: Railway static hosting
- Source: `apps/web`
- Build output: Vite `dist/`
- Hosting strategy: build the static app and serve it from Railway with a lightweight static server
- Branch strategy:
  - Production can track `develop` during the early phase
  - Preview environments should come from pull requests

### API

- Platform: Railway
- Source: `apps/api`
- Branch strategy:
  - Production can track `develop` during the early phase
  - Preview environments should come from pull requests

### Queue-Times Cron

- Platform: Railway Cron Job
- Source: `apps/queue-times-cron`
- Runtime model:
  - starts
  - ingests Queue-Times snapshots
  - exits
- Branch strategy:
  - Production can track `develop` during the early phase
  - Preview environments are optional for this service; production scheduling matters more than PR previews

### Catalog Import

- Platform: Railway job service
- Source: `apps/catalog-import`
- Runtime model:
  - starts
  - imports Queue-Times park and ride catalog data into Coasterly
  - exits
- Branch strategy:
  - Production can track `develop` during the early phase
  - Preview environments are optional; manual runs and controlled non-production environments matter more than PR previews

### Database

- Platform: Railway PostgreSQL
- Usage:
  - one production database service
  - one non-production database service or Railway environment for `develop` and preview work

## Minimal Deployment Flow

1. Push work to a `feature/*` or `fix/*` branch.
2. Open a pull request into `develop`.
3. Let Railway create preview environments for the web and API services.
4. Point preview and non-production API environments to Railway PostgreSQL `DATABASE_URL` credentials.
5. Merge tested work into `develop`.
6. Promote to `main` through the Gitflow release process once the Railway setup is stable.

## Environment Variables

Document these values in Railway instead of relying on local-only `.env` usage.

### Web (`apps/web`)

- `VITE_API_BASE_URL`
  - Public base URL for the API used by the web app.
  - Example: `https://coasterly-api-production.up.railway.app`

### API (`apps/api`)

- `HOST`
  - Host binding for the API process.
  - Recommended cloud default: `0.0.0.0`
- `PORT`
  - Port assigned by the Railway runtime.
- `DATABASE_URL`
  - PostgreSQL connection string from Railway PostgreSQL.
  - The API bootstraps the `parks` table and seed parks on first start.
- `CORS_ORIGIN`
  - Allowed origin for the web app.
  - Set this to the Railway web domain and any approved preview domains.
- `NODE_ENV`
  - Environment mode such as `production`, `staging`, or `development`
- `QUEUE_TIMES_BASE_URL`
  - Optional override for the Queue-Times API base URL.
  - Default: `https://queue-times.com`
  - Leave unset in normal Railway environments unless you intentionally proxy or mock the integration.
- `WEB_BASE_URL`
  - Public web origin used to return users to the app after Google sign-in.
  - Example: `https://coasterly-web.up.railway.app`
- `SESSION_COOKIE_SECRET`
  - Long random secret used to sign OAuth state and authenticated session cookies.
- `GOOGLE_CLIENT_ID`
  - Google OAuth client ID for the Railway API environment.
- `GOOGLE_CLIENT_SECRET`
  - Google OAuth client secret for the Railway API environment.
- `GOOGLE_REDIRECT_URI`
  - OAuth callback URL registered with Google.
  - Example: `https://coasterly-api-production.up.railway.app/auth/google/callback`
- `COASTERLY_ENABLE_SEEDED_FALLBACK`
  - Optional seeded-user fallback toggle for local or non-auth environments.
  - Recommended production value: `false`
  - Enable only intentionally for local development or temporary non-auth preview flows.

### Queue-Times Cron (`apps/queue-times-cron`)

- `DATABASE_URL`
  - PostgreSQL connection string from Railway PostgreSQL.
- `QUEUE_TIMES_BASE_URL`
  - Optional override for the Queue-Times API base URL.
  - Default: `https://queue-times.com`

### Catalog Import (`apps/catalog-import`)

- `DATABASE_URL`
  - PostgreSQL connection string from Railway PostgreSQL.
- `QUEUE_TIMES_BASE_URL`
  - Optional override for the Queue-Times API base URL.
  - Default: `https://queue-times.com`
- `QUEUE_TIMES_IMPORT_PARK_IDS`
  - Optional comma-separated list of Queue-Times park IDs for a targeted run.
  - Useful for testing or incremental rollout.
- `QUEUE_TIMES_IMPORT_CONTINENTS`
  - Optional comma-separated list of Queue-Times continents for a scoped run.
  - Useful for rolling out worldwide coverage in controlled slices such as `Europe`, `Asia`, or `North America`.
- `QUEUE_TIMES_IMPORT_COUNTRIES`
  - Optional comma-separated list of countries for a scoped run.
  - Useful when validating naming/search behavior in one country before broadening the import.
- `QUEUE_TIMES_IMPORT_PARK_LIMIT`
  - Optional numeric cap for how many parks a single run should import.
  - Useful for controlled first runs in Railway.

## Provider Setup Notes

### Railway Web

1. Import the GitHub repository into Railway as a JavaScript monorepo.
2. Select the staged web service for `@coasterly/web`.
3. Keep the service pointed at `apps/web/railway.json` so build, start, and healthcheck settings come from code.
4. Build with `pnpm --filter @coasterly/web build`.
5. Start with `node node_modules/serve/build/main.js -s apps/web/dist -l tcp://0.0.0.0:$PORT`.
6. Set the healthcheck path to `/`.
7. Add `VITE_API_BASE_URL` in the web service variables.
8. Enable Railway PR environments for preview deployments.

### Railway API

1. Import the same GitHub repository into the Railway project.
2. Select the staged API service for `@coasterly/api`.
3. Keep the service pointed at `apps/api/railway.json` so build, start, and healthcheck settings come from code.
4. Build with `pnpm --filter @coasterly/api build`.
5. Start with `node apps/api/dist/index.js`.
6. Set the healthcheck path to `/health`.
7. Add `DATABASE_URL`, `CORS_ORIGIN`, `HOST`, `PORT`, `NODE_ENV`, `WEB_BASE_URL`, `SESSION_COOKIE_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI`.
8. Keep `COASTERLY_ENABLE_SEEDED_FALLBACK=false` in production. Only enable it deliberately in local development or short-lived non-auth environments.
9. If Queue-Times-backed live waits are enabled, keep `QUEUE_TIMES_BASE_URL` unset unless you need a non-default API host.
10. Register the Railway API callback URL with the Google OAuth client and ensure the Railway web origin is allowed in `CORS_ORIGIN`.
11. After first deploy, verify `GET /parks` returns the seeded parks from PostgreSQL.
12. Verify `GET /me` returns `401` when signed out in production and an authenticated user after Google sign-in.
13. Verify `GET /parks/:slug/live-waits` returns a normalized Coasterly response and keep the required `Powered by Queue-Times.com` attribution visible in the web UI.

### Railway PostgreSQL

1. Add a PostgreSQL service to the same Railway project.
2. Use the service-provided `DATABASE_URL` for the API service.
3. Keep production and non-production credentials separated by Railway environment.
4. Redeploy the API service after updating any database credentials.

### Railway Queue-Times Cron

1. Import the same GitHub repository into the Railway project as a separate service.
2. Select the staged cron service for `@coasterly/queue-times-cron`.
3. Point the service at `apps/queue-times-cron/railway.json`.
4. Build with `pnpm --filter @coasterly/queue-times-cron build`.
5. Start with `node apps/queue-times-cron/dist/index.js`.
6. Set `DATABASE_URL` and, if needed, `QUEUE_TIMES_BASE_URL`.
7. Keep the restart policy set to `NEVER` so a failed run does not automatically loop.
8. Use Railway's cron schedule support with a five-field UTC cron expression.
9. Recommended initial cron schedule: `*/15 * * * *`.
10. After deploy, confirm logs show a full run with processed park counts and inserted snapshot counts, and that the process exits cleanly.

### Railway Catalog Import

1. Import the same GitHub repository into the Railway project as a separate service.
2. Select the staged catalog import service for `@coasterly/catalog-import`.
3. Point the service at `apps/catalog-import/railway.json`.
4. Build with `pnpm --filter @coasterly/catalog-import build`.
5. Start with `node apps/catalog-import/dist/index.js`.
6. Set `DATABASE_URL` and, if needed, `QUEUE_TIMES_BASE_URL`.
7. Add `QUEUE_TIMES_IMPORT_PARK_IDS`, `QUEUE_TIMES_IMPORT_CONTINENTS`, `QUEUE_TIMES_IMPORT_COUNTRIES`, or `QUEUE_TIMES_IMPORT_PARK_LIMIT` for controlled non-production runs when needed.
8. Keep the restart policy set to `NEVER` so the import exits cleanly after one run.
9. After deploy, confirm logs show discovered, selected, processed, and upserted park and ride counts.

## Vercel-to-Railway Web Cutover

Use this sequence to move the web app from Vercel to Railway safely:

1. Keep the existing Vercel deployment active while Railway web is configured and validated.
2. Deploy the Railway web service from `develop`.
3. Set `VITE_API_BASE_URL` on Railway web to the Railway API public domain for the same environment.
4. Verify static asset delivery, SPA routing, and API connectivity on the Railway web domain.
5. If you use a custom domain, lower DNS TTL before the cutover window.
6. Move the custom domain from Vercel to Railway only after Railway is serving the expected build.
7. Keep Vercel available as rollback until Railway passes real traffic validation.

## Next Connection Step

The safest next infrastructure step is to connect GitHub to Railway and create:

- one Railway web service for `apps/web`
- one Railway API service for `apps/api`
- one Railway catalog import service for `apps/catalog-import`
- one Railway cron service for `apps/queue-times-cron`
- one Railway PostgreSQL service

After that, add Railway environment variables for production and preview environments, validate PR previews, and only then cut the web domain over from Vercel if needed.
