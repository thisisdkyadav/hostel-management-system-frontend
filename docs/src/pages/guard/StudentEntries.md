# Student Entries Page (`/src/pages/guard/StudentEntries.jsx`)

This page allows security guards (or other authorized personnel) to view, filter, and search through the history of student entry and exit records.

## Route

Likely corresponds to the `/guard/student-entries` or similar route.

## Purpose and Functionality

1.  **Display Entry Logs:** Fetches and displays student entry/exit records using the [`StudentEntryTable`](../../components/guard/StudentEntryTable.md) component.
2.  **Data Fetching:**
    - Fetches paginated and filtered entry records using `securityApi.getStudentEntries`.
    - Builds query parameters based on the current filter state (status, date, search term, page, limit).
    - Uses `useEffect` with a debounce (`setTimeout`) to fetch data when filters or page change.
    - Manages loading state.
3.  **Filtering:**
    - Uses [`FilterTabs`](../../components/common/FilterTabs.md) to filter records by status (All, Checked In, Checked Out).
    - Includes a [`SearchBar`](../../components/common/SearchBar.md) for text-based searching.
    - Provides an optional, toggleable advanced filter section (`showFilters`) allowing filtering by a specific `date`.
    - Includes controls to clear the date filter and change the number of items displayed per page (`itemsPerPage`).
    - Filter changes reset the current page to 1.
4.  **Pagination:**
    - Uses the [`Pagination`](../../components/common/Pagination.md) component to navigate through pages of results.
    - Updates the `currentPage` state, triggering a data refetch.
5.  **State Management:** Uses `useState` extensively to manage the search term, filter status, filter date, visibility of filters, fetched entries, loading state, and pagination parameters (current page, total pages, items per page, total items).
6.  **UI Feedback:** Displays a loading indicator and a [`NoResults`](../../components/common/NoResults.md) component when appropriate.

## Context Usage

- None apparent in the provided code snippet.

## Key Components Rendered

- [`FilterTabs`](../../components/common/FilterTabs.md)
- [`SearchBar`](../../components/common/SearchBar.md)
- [`StudentEntryTable`](../../components/guard/StudentEntryTable.md)
- [`Pagination`](../../components/common/Pagination.md) (conditionally rendered)
- [`NoResults`](../../components/common/NoResults.md) (conditionally rendered)

## API Usage

- `securityApi.getStudentEntries(queryParams)`

## Constants

- `ENTRY_FILTER_TABS`: An array defining the labels and values for the status filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaUserGraduate`, `FaFilter`
- `../../services/apiService`: `securityApi`
- `../../constants/adminConstants` (Likely, although `ENTRY_FILTER_TABS` is defined locally)
- `../../components/common/SearchBar`
- `../../components/common/FilterTabs`
- `../../components/common/NoResults`
- `../../components/guard/StudentEntryTable`
- `../../components/common/Pagination`
