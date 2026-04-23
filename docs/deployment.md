# Deployment Plan

This repository is set up for a cloud-first workflow:

- `main` is production
- `develop` is integration
- `feature/*`, `fix/*`, `release/*`, and `hotfix/*` branches flow through pull requests
- local development is optional, not the primary path for validation

## Platform Mapping

### Web

- Platform: Vercel
- Repository: connect the monorepo once and create a Vercel project for the web app
- Branch strategy:
  - Production deploys from `main`
  - Preview deploys from pull requests

### API

- Platform: Railway
- Repository: connect the monorepo once and deploy the API as its own service
- Branch strategy:
  - Production service tracks `main`
  - Staging or preview service can track `develop` or selected preview branches

### Database

- Platform: Neon
- Engine: PostgreSQL
- Usage:
  - one production database for `main`
  - one non-production database or branch for `develop` and preview work

## Minimal Deployment Flow

1. Push work to a `feature/*` or `fix/*` branch.
2. Open a pull request into `develop`.
3. Let Vercel create a preview deployment for the web app.
4. Let Railway deploy the API from the connected branch or staging environment.
5. Point non-production API environments to Neon non-production credentials.
6. Merge tested work into `develop`.
7. Promote to `main` through the Gitflow release process.

## Environment Variables

Document these values in each cloud provider instead of relying on local-only `.env` usage.

### Web (`apps/web`)

- `VITE_API_BASE_URL`
  - Public base URL for the API used by the web app.
  - Example: `https://api-staging.example.com`

### API (`apps/api`)

- `HOST`
  - Host binding for the API process.
  - Recommended cloud default: `0.0.0.0`
- `PORT`
  - Port assigned by the platform runtime.
  - Railway usually injects this automatically.
- `DATABASE_URL`
  - PostgreSQL connection string from Neon.
- `CORS_ORIGIN`
  - Allowed origin for the web app.
  - Set this to the Vercel production domain and any approved preview domains.
- `NODE_ENV`
  - Environment mode such as `production`, `staging`, or `development`

## Provider Setup Notes

### Vercel

1. Import the GitHub repository into Vercel as a monorepo project.
2. Create a Vercel project for `apps/web`.
3. Set the project's Root Directory to `apps/web`.
4. Enable Include source files outside of the Root Directory because `apps/web` imports `packages/types`.
5. Keep the Install Command unset so Vercel can detect pnpm from the root `pnpm-lock.yaml`.
6. Let Vercel use the Vite framework settings from `apps/web/vercel.json`.
7. Add `VITE_API_BASE_URL` for Preview and Production.
8. Keep production on `main` and rely on pull request previews for feature and fix branches.

### Railway

1. Create a Railway project from the same GitHub repository.
2. Let Railway detect the JavaScript monorepo or connect the repository to a dedicated API service.
3. Keep the service pointed at `apps/api/railway.json` so build, start, and healthcheck settings come from code.
4. Confirm the API service builds with `pnpm --filter @coasterly/api build`.
5. Confirm the API service starts with `node apps/api/dist/index.js` so Node receives shutdown signals directly.
6. Set the healthcheck path to `/health`.
7. Add `DATABASE_URL`, `CORS_ORIGIN`, `HOST`, `PORT`, and `NODE_ENV`.
8. Use a non-production environment for `develop` and preview work before wiring production to `main`.

### Neon

1. Create a Neon PostgreSQL project for Coasterly.
2. Keep the default Neon `main` branch for production data.
3. Create a separate non-production branch for `develop` or preview environments.
4. Retrieve a connection URI for each environment and store it as `DATABASE_URL` in Railway.
5. Keep Neon credentials out of the repository.

## Next Connection Step

The safest next infrastructure step is to connect GitHub first, then create:

- one Vercel project for `apps/web`
- one Railway service for `apps/api`
- one Neon project for PostgreSQL

After that, add environment variables in Vercel and Railway for production and non-production environments before enabling automatic promotion to `main`.
