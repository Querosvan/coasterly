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
- `global_editor`
- `super_admin`

At this stage roles are modeled as a lightweight global user attribute.

This is intentional:

- it is enough to anchor future admin and editorial work
- it avoids premature RBAC complexity
- it gives future auth work a stable target for user claims and admin checks

## Future Backoffice Scope

The expected editable areas for a future admin/backoffice surface are:

- parks
- rides
- media
- external source mappings
- discovery metadata
- summaries
- featured and curated flags

The current phase does not add admin UI yet. It only makes the future ownership boundaries clearer.

## Future Moderation And Editorial Path

The next layer after this foundation should be scoped ownership rather than more global role expansion.

Recommended future additions:

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
