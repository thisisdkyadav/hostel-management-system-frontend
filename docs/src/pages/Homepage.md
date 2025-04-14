# Homepage Page (`/src/pages/Homepage.jsx`)

This component serves as the main landing page for the Hostel Management System, typically displayed to unauthenticated users or as the root entry point.

## Route

Corresponds to the root path: `/`

## Purpose

1.  **Public Landing Page:** Displays a visually appealing hero section with:
    - A modern header ([`ModernHeader`](../components/home/ModernHeader.md)).
    - A title and descriptive text.
    - A prominent Call to Action (CTA) button that directs users to either the login page or their dashboard based on authentication status.
    - A decorative statistics graphic ([`StatisticsGraphic`](../components/home/StatisticsGraphic.md)).
    - Extensive use of Tailwind CSS for styling, including gradients, blur effects, and various animations (`pulse`, `fadeIn`, `slideUp`, `bounce`, `ping`, `float`) to create a dynamic background.
2.  **Standalone Mode Handler:** If the application is detected as running in `isStandalone` mode (determined via `useAuth`), this page acts as a router:
    - It displays a [`LoadingScreen`](../components/common/LoadingScreen.md).
    - Uses `useEffect` and `useNavigate` to immediately redirect:
      - Authenticated users to their specific home route (obtained via `getHomeRoute()`).
      - Unauthenticated users to the `/login` page.

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: To check if a user is currently logged in.
  - `getHomeRoute()`: To determine the correct dashboard/home route for the logged-in user.
  - `isStandalone`: A boolean flag indicating if the app is running in a special standalone mode.

## Key Components Rendered

- [`ModernHeader`](../components/home/ModernHeader.md): The header specific to the homepage.
- [`StatisticsGraphic`](../components/home/StatisticsGraphic.md): A visual component displaying statistics.
- [`LoadingScreen`](../components/common/LoadingScreen.md): Displayed only when `isStandalone` is true during the redirection phase.
- [`<Link>`](https://reactrouter.com/en/main/components/link) (from `react-router-dom`): Used for the CTA button.
- [`<FaArrowRight>`](https://react-icons.github.io/react-icons/icons?name=fa) (from `react-icons/fa`): Icon used in the CTA button.

## Dependencies

- `react`: `useEffect`
- `react-router-dom`: `Link`, `useNavigate`
- `react-icons/fa`: `FaArrowRight`
- `../contexts/AuthProvider`: `useAuth`
- `../components/home/ModernHeader`
- `../components/home/StatisticsGraphic`
- `../components/common/LoadingScreen`
