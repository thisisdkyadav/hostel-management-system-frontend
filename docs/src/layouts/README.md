# Layout Components (`/src/layouts`)

This directory contains layout components that define the overall structure and common UI elements (like sidebars, headers) for different sections or user roles within the application.

## Layouts Overview

- **`AdminLayout.jsx`**

  - **Summary:** Defines the layout structure for administrative pages, likely including an admin-specific sidebar/navigation and header.
  - _Future File:_ `./AdminLayout.md`

- **`StudentLayout.jsx`**

  - **Summary:** Defines the layout for pages accessible to students, including student-specific navigation.
  - _Future File:_ `./StudentLayout.md`

- **`WardenLayout.jsx`**

  - **Summary:** Defines the layout for pages accessible to Wardens, including warden-specific navigation.
  - _Future File:_ `./WardenLayout.md`

- **`AssociateWardenLayout.jsx`**

  - **Summary:** Defines the layout for pages accessible to Associate Wardens, potentially similar to `WardenLayout` but with adjusted permissions/navigation.
  - _Future File:_ `./AssociateWardenLayout.md`

- **`SecurityLayout.jsx`**

  - **Summary:** Defines the layout for pages accessible to Security Guards, including security-specific navigation.
  - _Future File:_ `./SecurityLayout.md`

- **`MaintenanceLayout.jsx`**
  - **Summary:** Defines the layout for pages related to the maintenance staff or interface, including relevant navigation.
  - _Future File:_ `./MaintenanceLayout.md`

## Usage

Layout components typically wrap route definitions (often within `AppRoutes.jsx`) to apply a consistent structure to all pages belonging to a specific role or section. They usually render common elements (like a sidebar) and an `Outlet` component from `react-router-dom` where the specific page content is rendered.

## Documentation

Each layout component (e.g., `MainLayout.jsx`) should have its documentation file (e.g., `docs/src/layouts/MainLayout.md`). This file should explain:

- The purpose of the layout and which pages it's intended for.
- The structure it provides (e.g., includes sidebar, header).
- Any props it accepts for customization.

## Available Layouts

_(List and link to the documentation for individual layouts as they are created)_

- [`MainLayout.md`](./MainLayout.md)
- [`AuthLayout.md`](./AuthLayout.md)
- ... _(add other layouts)_
