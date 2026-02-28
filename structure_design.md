# Frontend Structure Design

This document defines frontend structure rules. Keep UI authz simple and predictable.

## Rule 1: Page Visibility AuthZ Pattern

Default pattern:
1. Use route keys as the primary control for what a user can see.
2. Guard each route with `RouteAccessGuard`.
3. Filter layout navigation items with `useAuthorizedNavItems(...)`.

Implementation points:
1. Route gating:
   - `src/components/authz/RouteAccessGuard.jsx`
2. Nav filtering:
   - `src/hooks/useAuthorizedNavItems.js`
3. Authz state access:
   - `src/hooks/useAuthz.js`
   - `src/contexts/AuthzProvider.jsx`

Capability usage rule:
1. Do not create generic capability wrapper components by default.
2. Use `can(...)` / `canAny(...)` from `useAuthz` directly in feature components when needed.
3. Add capability checks only for explicitly planned capability-gated features.

Constraint usage rule:
1. Use `getConstraint(...)` only where UI must adapt to an active backend constraint.
2. Do not keep reads for retired/undefined constraint keys.

Refactor policy:
1. Prefer one obvious path (route guard + nav filter) over multiple parallel patterns.
2. If a helper is unused, delete it.
3. Keep authz helpers fail-closed and minimal.
