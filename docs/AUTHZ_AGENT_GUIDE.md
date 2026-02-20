# Frontend AuthZ Agent Guide

## Purpose

This guide is for future coding agents working on frontend authorization behavior.

Current frontend access model:
1. RBAC route shell remains via existing role routes/layouts.
2. Layer-3 AuthZ controls route visibility and in-page actions.

Legacy frontend permission helper (`canAccess`) and access-control API are retired and must not be reintroduced.

## Core Files (Frontend)

1. AuthZ context/provider:
   - `src/contexts/AuthzProvider.jsx`
2. AuthZ hook:
   - `src/hooks/useAuthz.js`
3. AuthZ helpers:
   - `src/utils/authz.js`
4. AuthZ API client:
   - `src/service/modules/authz.api.js`
5. Guard components:
   - `src/components/authz/RouteAccessGuard.jsx`
   - `src/components/authz/CapabilityGuard.jsx`
6. Provider wiring:
   - `src/App.jsx` (must include `AuthzProvider`)

## Frontend Authorization Pattern (Required)

Use these patterns:

1. Route/page protection:
   - `RouteAccessGuard routeKey="route.xxx"` for route elements.
2. Nav filtering:
   - Use `useAuthz().canRouteByPath(path)` or key-based checks when building nav items.
3. Action/button visibility:
   - Use `useAuthz().can("cap.xxx")`, `canAny(...)`, `canAll(...)`
   - Or wrap with `CapabilityGuard`.
4. Constraint-driven UI:
   - Use `getConstraint("constraint.xxx", fallback)` for scoped enable/disable/editability.

Always keep backend enforcement in mind: UI guards are UX + first line, backend is final authority.

## Adding a New Feature (Frontend)

When adding a new page/action:

1. Coordinate with backend to add catalog keys (`route.*`, `cap.*`, optional `constraint.*`).
2. Add route config in the correct role routes file and apply `RouteAccessGuard`.
3. Add nav item and filter it through AuthZ route access.
4. Guard sensitive actions with capability checks.
5. If feature has partial edit rules, read constraints and reflect in UI controls.
6. Keep existing hard-coded role boundaries intact unless explicitly changed by product decision.

## Adding a New Role/User Type (Frontend)

If a new role is introduced:

1. Add role home routing behavior in auth/route shells as needed.
2. Add a dedicated layout/routes set or extend existing role family safely.
3. Ensure nav configuration exists for that role and is AuthZ-aware.
4. Ensure page-level route guards use matching `route.<roleFamily>.*` keys.
5. Ensure in-page actions use capability keys and not role-name conditionals wherever possible.

## Hard-Coded Boundaries Rule

Some controls are intentionally fixed by role (example: admin-only controls).
Do not convert these into freely configurable AuthZ toggles unless explicitly instructed.
AuthZ should refine allowed surface, not silently expand fixed business boundaries.

## Anti-Patterns (Do Not Do)

1. Do not add `canAccess` back.
2. Do not call retired `/permissions` APIs.
3. Do not rely only on hidden buttons for security assumptions.
4. Do not hard-code new role checks for actions when a capability key exists or should exist.

## Quick Pre-Merge Checklist (Frontend)

1. New page has route guard (`RouteAccessGuard`) when appropriate.
2. New nav items are filtered by AuthZ route access.
3. Sensitive actions are capability-guarded.
4. Constraint-aware fields/components read constraints from AuthZ context.
5. No legacy permission symbols:
   - `canAccess`
   - `accessControlApi`
   - `/permissions`

