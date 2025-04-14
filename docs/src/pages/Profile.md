# Profile Page (`/src/pages/Profile.jsx`)

This page serves as a container to display the user's profile information.

## Route

Likely corresponds to a route like `/profile`.

## Purpose and Functionality

1.  **Role-Based Profile Display:** Checks the `role` of the currently logged-in `user` (obtained from `useAuth`).
2.  **Conditional Rendering:** Uses a `switch` statement (`renderProfile` function) to render the specific profile component corresponding to the user's role:
    - `Student`: Renders [`StudentProfile`](../components/profile/StudentProfile.md).
    - `Warden` or `Associate Warden`: Renders [`WardenProfile`](../components/profile/WardenProfile.md).
    - `Admin`: Renders [`AdminProfile`](../components/profile/AdminProfile.md).
    - Other roles: Displays a fallback message.
3.  **Layout:** Provides a basic page structure with a title ("My Profile") and renders the selected profile component within a styled container.

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: To get the current user object and determine their role.

## Key Components Rendered

- [`StudentProfile`](../components/profile/StudentProfile.md) (conditionally rendered)
- [`WardenProfile`](../components/profile/WardenProfile.md) (conditionally rendered)
- [`AdminProfile`](../components/profile/AdminProfile.md) (conditionally rendered)

## Dependencies

- `react`: `useState` (Note: `activeTab` state is defined but not used within this component itself; it's likely passed down to the child profile components).
- `../contexts/AuthProvider`: `useAuth`
- `../components/profile/StudentProfile`
- `../components/profile/WardenProfile`
- `../components/profile/AdminProfile`
