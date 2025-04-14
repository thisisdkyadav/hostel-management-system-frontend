# Guard Dashboard Page (`/src/pages/guard/Dashboard.jsx`)

This page serves as the main dashboard interface for Security Guard users.

## Route

Likely corresponds to the `/guard` or `/guard/dashboard` route.

## Purpose and Functionality

This component acts as a container for the primary guard functions.

- Renders the [`DashboardHeader`](../../components/guard/DashboardHeader.md) component, which likely displays relevant information or navigation for the guard.
- Directly renders the [`AddStudentEntry`](./AddStudentEntry.md) page component within the dashboard layout. This suggests the main function of the guard dashboard is to facilitate adding student entries.

## Key Components Rendered

- [`DashboardHeader`](../../components/guard/DashboardHeader.md)
- [`AddStudentEntry`](./AddStudentEntry.md) (as a page component embedded within the dashboard)

## Dependencies

- `../../components/guard/DashboardHeader`
- `./AddStudentEntry`
