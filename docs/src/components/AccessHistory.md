# Access History Component (`/src/components/AccessHistory.jsx`)

This component displays a student's campus access history (check-in/check-out records) with filtering and pagination capabilities.

## Purpose and Functionality

1.  **Display Entry Logs:** Fetches and displays student entry/exit records.
    - Uses a table layout (`<table>`) for larger screens (`lg:block`).
    - Uses a list of cards (`<div>`) for smaller screens (`lg:hidden`).
2.  **Data Fetching & Caching:**
    - Accepts `cachedData` via props.
    - If online (`isOnline` from `useAuth`), fetches paginated and filtered entry records using `securityApi.getStudentEntries`.
    - If offline or if the API call fails, it attempts to use the `cachedData` (if provided).
    - The `processCachedData` helper function applies status and date filters, and pagination logic to the cached data client-side.
    - Uses `useEffect` with a debounce (`setTimeout`) to fetch data when filters, page, or online status change.
    - Manages loading state.
3.  **Filtering:**
    - Uses [`FilterTabs`](./common/FilterTabs.md) to filter records by status (All, Checked In, Checked Out).
    - Provides an optional, toggleable advanced filter section (`showFilters`) allowing filtering by a specific `date`.
    - Includes controls to clear the date filter and change the number of items displayed per page (`itemsPerPage`).
    - Filter changes reset the current page to 1.
4.  **Pagination:**
    - Uses the [`Pagination`](./common/Pagination.md) component to navigate through pages of results.
    - Updates the `currentPage` state, triggering a data refetch or re-processing of cached data.
5.  **State Management:** Uses `useState` extensively to manage filter status, filter date, visibility of filters, fetched/processed entries, loading state, and pagination parameters.
6.  **UI Feedback:** Displays a loading indicator and a [`NoResults`](./common/NoResults.md) component when appropriate, including specific messages for offline scenarios without cached data.
7.  **Formatting:** Includes utility functions (`formatDate`, `formatTime`) to display timestamps nicely.

## Props

- `cachedData` (Object, optional): Pre-fetched access history data (likely including `studentEntries` and `meta`) used for offline display or fallback.

## Context Usage

- **`useAuth`** (from `../contexts/AuthProvider`):
  - `isOnline`: Boolean indicating network status, used for fetching/caching logic.

## Key Components Rendered

- [`FilterTabs`](./common/FilterTabs.md)
- [`NoResults`](./common/NoResults.md) (conditionally rendered)
- [`Pagination`](./common/Pagination.md) (conditionally rendered)

## API Usage

- `securityApi.getStudentEntries(queryParams)`

## Constants

- `ENTRY_FILTER_TABS`: An array defining the labels and values for the status filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaHistory`, `FaFilter`, `FaSignInAlt`, `FaSignOutAlt`, `FaCalendarAlt`, `FaClock`
- `../contexts/AuthProvider`
- `../services/apiService`: `securityApi`
- `./common/FilterTabs`
- `./common/NoResults`
- `./common/Pagination`
