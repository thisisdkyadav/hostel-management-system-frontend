# Routing (`/src/routes`)

This directory contains the application's routing configuration, typically using `react-router-dom`.

## Files Overview

- **`AppRoutes.jsx`**
  - **Summary:** Defines the main routing structure of the application. It likely sets up `BrowserRouter` and defines `Routes` containing individual `Route` components. Maps URL paths to specific page components (from `/src/pages`) and wraps them with appropriate layout components (from `/src/layouts`). May also include logic for protected routes based on authentication status or user roles.
  - _Future File:_ `./AppRoutes.md`

## Purpose

The routing setup determines how users navigate between different pages of the application based on the URL.

## Structure

Depending on the complexity, the routing setup might involve:

- **A central router configuration file (e.g., `index.jsx` or `AppRoutes.jsx`):** Defines all the application routes using `<Routes>`, `<Route>`, etc.
- **Protected Route Components:** Components to handle authentication checks and redirect users if they are not authorized to access certain routes.
- **Role-Based Route Components:** Components to handle authorization based on user roles (e.g., Student, Warden, Admin).
- **Lazy Loading Configuration:** Setup for code-splitting and loading page components lazily.

## Key Files/Components

_(List and link to the documentation for key routing files/components as they are created)_

- [`index.jsx` / `AppRoutes.jsx`](./index.md): Main router configuration.
- [`ProtectedRoute.jsx`](./ProtectedRoute.md): Handles authentication checks.
- [`RoleBasedRoute.jsx`](./RoleBasedRoute.md): Handles role-based access control.
- ... _(add other relevant files)_

## Related Areas

- **Pages (`/src/pages`):** Components rendered by the routes.
- **Layouts (`/src/layouts`):** Components used to wrap routes/pages.
- **Contexts (`/src/contexts`):** Often used by protected routes (e.g., `AuthContext`) to check user status.
