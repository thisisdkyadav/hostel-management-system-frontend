# Source Code Documentation (`/src`)

This section provides detailed documentation for the source code of the Hostel Management System frontend, located in the `/src` directory.

## Directory Structure Overview

The `/src` directory is organized as follows:

- [`/assets`](./assets/README.md): Contains static assets like images, icons, etc.
- [`/components`](./components/README.md): Reusable UI components used throughout the application. Further categorized by feature or commonality.
- [`/constants`](./constants/README.md): Application-wide constants (e.g., API endpoints, configuration values).
- [`/contexts`](./contexts/README.md): React Context API providers for managing global or feature-specific state.
- [`/hooks`](./hooks/README.md): Custom React hooks for reusable logic.
- [`/layouts`](./layouts/README.md): Components that define the overall structure or layout of pages (e.g., `MainLayout`, `AuthLayout`).
- [`/pages`](./pages/README.md): Top-level components representing application pages/views.
- [`/routes`](./routes/README.md): Configuration and components related to application routing (using React Router).
- [`/services`](./services/README.md): Modules responsible for making API calls and interacting with the backend.
- [`/utils`](./utils/README.md): Utility functions used across different parts of the application.

## Core Files

- [`main.jsx`](./main.md): The main entry point of the application. Initializes React, sets up routing, and renders the root `App` component.
- [`App.jsx`](./App.md): The root component of the application. Often sets up global providers (like Contexts) and the main router outlet.
- [`index.css`](./index-css.md): Global CSS styles or Tailwind CSS base/component/utility layer definitions.

## Navigation

Click the links above to navigate to the specific documentation for each directory or core file.
