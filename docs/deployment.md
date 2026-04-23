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
7. Add `DATABASE_URL`, `CORS_ORIGIN`, `HOST`, `PORT`, and `NODE_ENV`.
8. After first deploy, verify `GET /parks` returns the seeded parks from PostgreSQL.

### Railway PostgreSQL

1. Add a PostgreSQL service to the same Railway project.
2. Use the service-provided `DATABASE_URL` for the API service.
3. Keep production and non-production credentials separated by Railway environment.
4. Redeploy the API service after updating any database credentials.

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
- one Railway PostgreSQL service

After that, add Railway environment variables for production and preview environments, validate PR previews, and only then cut the web domain over from Vercel if needed.
