# Notification Center Page (`/src/pages/NotificationCenter.jsx`)

This page provides an interface for viewing, managing, and creating system-wide notifications.

## Route

Likely corresponds to a route like `/notifications` or similar, depending on the routing setup.

## Purpose and Functionality

1.  **Display Notifications:** Fetches and displays a list of notifications using the [`NotificationTable`](../components/notifications/NotificationTable.md) component.
2.  **Data Fetching:**
    - Uses `notificationApi.getNotifications` to fetch a paginated list of notifications based on the current filters.
    - Uses `notificationApi.getNotificationStats` to fetch statistics (total, active, expired) displayed via [`NotificationStats`](../components/notifications/NotificationStats.md).
3.  **Filtering:**
    - Provides status filtering (All, Active, Expired) using [`FilterTabs`](../components/common/FilterTabs.md).
    - Includes an optional, toggleable advanced filter section ([`NotificationFilterSection`](../components/notifications/NotificationFilterSection.md)) for filtering by hostel, degree, department, gender, and search term.
    - Manages filter state using `useState` and updates trigger a data refetch.
4.  **Pagination:** Implements pagination using the [`Pagination`](../components/common/Pagination.md) component when the total number of notifications exceeds the items per page.
5.  **Notification Creation (Admin):**
    - An admin-only button ("Create Notification") toggles the visibility of the [`CreateNotificationModal`](../components/notifications/CreateNotificationModal.md).
    - Successful creation triggers a refetch of the notification list.
6.  **State Management:** Uses `useState` to manage the list of notifications, loading state, error messages, filter values, pagination state, modal visibility, and notification statistics.
7.  **Access Control:** Uses `useAuth` to check the user's role and conditionally renders the "Create Notification" and filter toggle buttons for Admins.
8.  **UI Feedback:**
    - Displays a loading spinner while data is being fetched.
    - Shows a [`NoResults`](../components/common/NoResults.md) component if no notifications match the criteria.
    - Displays an error message banner if data fetching fails.

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: To check the user's role for access control.

## Key Components Rendered

- [`NotificationStats`](../components/notifications/NotificationStats.md)
- [`FilterTabs`](../components/common/FilterTabs.md)
- [`NotificationFilterSection`](../components/notifications/NotificationFilterSection.md) (conditionally rendered)
- [`NotificationTable`](../components/notifications/NotificationTable.md)
- [`Pagination`](../components/common/Pagination.md) (conditionally rendered)
- [`NoResults`](../components/common/NoResults.md) (conditionally rendered)
- [`CreateNotificationModal`](../components/notifications/CreateNotificationModal.md) (conditionally rendered)

## API Usage

- `notificationApi.getNotifications(queryParams)`
- `notificationApi.getNotificationStats()`

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaBell`, `FaPlus`, `FaFilter`
- `../services/notificationApi`
- Multiple components from `/src/components/notifications` and `/src/components/common`
- `../contexts/AuthProvider`
