# Coasterly User And Admin Foundations

## Current Direction

Coasterly still exposes the current ride-credit and progress flows through the seeded demo user, but the underlying model is no longer treated as "demo-only".

- `users` is now a future-ready foundation table
- ride credits remain attached to users through `user_ride_credits`
- current `/demo-user/...` endpoints stay in place as a compatibility layer for the existing product flows

## User Model Foundation

The `users` table now supports:

- `slug`
- `name`
- `role`
- optional `email`
- optional `auth_provider`
- optional `auth_subject`
- `is_seeded`
- `created_at`
- `updated_at`

This keeps the current seeded user useful for development while leaving room for future real-user identity providers without needing another schema rewrite.

## Role Foundation

The current intended roles are:

- `user`
- `moderator`
- `regional_editor`
- `admin`
- `global_editor`
- `super_admin`

At this stage roles are modeled as a lightweight global user attribute.

This is intentional:

- it is enough to anchor future admin and editorial work
- it avoids premature RBAC complexity
- it gives future auth work a stable target for user claims and admin checks

The intended role semantics are:

- `super_admin`
  - server-controlled root role
  - reserved for trusted Google accounts listed in `COASTERLY_ADMIN_EMAILS`
  - cannot be granted from the client
  - intended to manage top-level admin access and role delegation policy
- `admin`
  - full app-level catalog/admin role
  - intended to manage lower roles and edit everything once write tooling exists
- `global_editor`
  - edit catalog and editorial data across all regions
- `regional_editor`
  - edit catalog and editorial data for assigned regions only
  - region scoping is future work; it is not enforced yet
- `moderator`
  - intended for comments, profiles, and user-submitted media moderation
  - moderation tooling is still future work
- `user`
  - default product user role

Current implementation note:

- roles are persisted server-side only
- no client-side role changes exist
- `super_admin` bootstrap currently happens only from verified Google sign-in plus `COASTERLY_ADMIN_EMAILS`
- finer-grained edit/moderation permissions are not implemented yet

## Current Admin Enforcement

The foundation now includes the first real server-side role enforcement for admin-only API surfaces.

Allowed roles for the current admin review endpoints:

- `moderator`
- `regional_editor`
- `global_editor`
- `admin`
- `super_admin`

Current protected endpoints:

- `GET /admin/parks`
- `GET /admin/rides`

Behavior:

- signed-out requests are rejected through the normal current-user resolution path
- signed-in users without an admin/editorial role receive `403`
- public catalog endpoints remain unchanged and public

This is still intentionally lightweight:

- there is no broad RBAC matrix yet
- there are no per-field permissions yet
- there is no scoped regional ownership enforcement yet

## Future Backoffice Scope

The expected editable areas for a future admin/backoffice surface are:

- parks
- rides
- media
- external source mappings
- discovery metadata
- summaries
- featured and curated flags

## Current Admin Review Surface

The current phase now adds a minimal web admin surface at `/admin`.

This surface is intentionally read-only and only visible to moderator/editor/admin roles.

Current review coverage:

- parks list
- rides list
- status
- media availability
- Queue-Times mapping availability
- name and slug inspection

This is not a full backoffice yet.

Still out of scope:

- editing
- moderation workflows
- audit history
- bulk actions
- media management tools
- source-mapping editors

## Future Moderation And Editorial Path

The next layer after this foundation should be scoped ownership rather than more global role expansion.

Recommended future additions:

- explicit role-management flows restricted to `super_admin`
- writable catalog/editorial tools for `admin` and editors
- scoped editorial assignments for `regional_editor`
- content ownership records for curated discovery collections and summaries
- moderation records for change review, hide/unhide actions, and audit visibility

That future model should likely use dedicated assignment or workflow tables instead of pushing region-specific logic directly into the `users` table.

## Why This Is Enough For Now

This pass is deliberately small.

- no login or sessions yet
- no auth UI yet
- no full backoffice yet
- no full moderation workflow yet

The foundation is now strong enough that those later phases can build on stable user and role primitives instead of replacing the demo-only assumptions later.

## Auth Identity Groundwork

The API now has a minimal current-user resolution path.

- `GET /me` returns the current user and how that user was resolved
- `GET /me/ride-credits` and `GET /me/stats` expose the current-user view of the existing ride-credit and progress flows
- ride credit mutations now resolve the current user first instead of conceptually depending on the demo user

Current-user resolution works like this:

1. If provider identity claims are present, the API attempts to resolve a user through:
   - `auth_provider`
   - `auth_subject`
2. If no auth identity is present, the API falls back to the seeded user
3. If auth identity is present but does not map to a Coasterly user, the API returns an auth-style failure instead of silently falling back

For now, the API reads a lightweight provider-agnostic identity shape from request headers:

- `x-coasterly-auth-provider`
- `x-coasterly-auth-subject`

This is intentionally a bridge step, not a final auth solution.

- a future auth middleware or gateway can populate those values from real provider claims
- the database model already has the fields needed to link those claims to users
- the public product can keep working in non-auth environments through the seeded fallback

## Compatibility

The existing `/demo-user/...` endpoints are still available.

They remain useful as compatibility surfaces for the current frontend while the product transitions toward real current-user handling.
