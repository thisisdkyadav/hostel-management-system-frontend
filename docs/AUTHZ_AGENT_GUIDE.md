# Frontend AuthZ Agent Guide

## Current Model

Frontend authz is route-first.

Frontend layer-3 behavior is strict:
- deny by default when authz state is unavailable
- do not add fail-open fallback behavior for unknown routes/capabilities

1. Navigation/page availability is controlled by Layer-3 route keys.
2. Capability usage is intentionally reduced to one pilot only:
   - `cap.students.edit.personal`
3. Constraint usage is intentionally reduced to one pilot only:
   - `constraint.complaints.scope.hostelIds`

Do not reintroduce retired permission helpers/APIs.

## Core Files

1. Provider: `src/contexts/AuthzProvider.jsx`
2. Hook: `src/hooks/useAuthz.js`
3. Helpers: `src/utils/authz.js`
4. Route guard: `src/components/authz/RouteAccessGuard.jsx`
5. Superadmin authz UI: `src/pages/superadmin/AuthzManagementPage.jsx`
6. Help page: `src/pages/superadmin/AuthzHelpPage.jsx`
7. Nav filtering hook: `src/hooks/useAuthorizedNavItems.js`

Admin UI does not expose AuthZ management. Override management is Super Admin only.

## What Is Capability-Gated Right Now

Only student personal edit UI remains capability-gated:
`src/components/common/students/StudentDetailModal.jsx`

Capability-route hint mapping is limited to student routes:
`src/utils/authzRouteCapabilityHints.js`

## Required Pattern For New UI Work

1. Add/update route key in backend catalog.
2. Gate route/page with `RouteAccessGuard` and route-aware nav visibility.
3. Use `useAuthorizedNavItems(...)` in layouts for show/hide navigation links.
4. Do not add new capability checks unless explicitly requested for a planned pilot.

## If A New Capability Is Needed Later

Add incrementally for one feature at a time:
1. Add key in backend catalog.
2. Enforce in backend endpoints.
3. Add minimal frontend checks (`can`, `canAny`) only for that feature.
4. Add clear help text in superadmin authz help/editor.

## If A New Constraint Is Needed Later

1. Add key in backend catalog.
2. Enforce in backend service logic.
3. Use `getConstraint(...)` in frontend only where UX must adapt.
4. Explain the constraint in help docs/modal text.

## Guardrails

1. Keep hard-coded role boundaries unchanged unless explicitly asked.
2. Route checks are the default mechanism.
3. Avoid broad capability frameworks before per-feature agreement.
4. Keep naming consistent with backend catalog keys.
