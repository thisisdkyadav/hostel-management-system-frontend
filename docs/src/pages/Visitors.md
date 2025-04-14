# Visitors Page (`/src/pages/Visitors.jsx`)

This page provides an overview and management interface for visitor records, likely focusing on check-in and check-out status.

## Route

Likely corresponds to a route like `/visitors` or `/security/visitors`.

## Purpose and Functionality

1.  **Display Visitor Records:** Fetches visitor records using `securityApi.getVisitors` and displays them in a table using the [`VisitorTable`](../components/visitor/VisitorTable.md) component.
2.  **Data Fetching:** Fetches the list of visitor records on component mount and whenever filters change using `useEffect` and `securityApi.getVisitors`.
3.  **Filtering:**
    - Uses [`FilterTabs`](../components/common/FilterTabs.md) to filter records by check-in status (All, Checked In, Checked Out).
    - Includes a [`SearchBar`](../components/common/SearchBar.md) for text-based searching.
    - Provides an optional, toggleable advanced filter section to filter by a specific `date`.
    - Filtering logic (combining status, date, and search term) is handled client-side by the imported utility function `filterVisitors` (from `../utils/securityUtils`).
4.  **Statistics:** Displays visitor statistics (likely counts based on status) using the [`VisitorStats`](../components/visitor/VisitorStats.md) component.
5.  **State Management:** Uses `useState` to manage the full list of visitor records, filter values (status, date, search term), and the visibility of the advanced filter section.
6.  **Local State Updates:** Includes handler functions (`handleUpdateVisitor`, `handleDeleteVisitor`) that update the local `visitors` state. These are likely passed down to `VisitorTable` to be called after an update or delete action occurs within that component, providing immediate UI feedback before a full refresh might happen.
7.  **UI Feedback:** Displays a [`NoResults`](../components/common/NoResults.md) component if no visitor records match the current filter and search criteria.

## Utility Functions

- `filterVisitors(visitors, filterStatus, filterDate, searchTerm)` (from `../utils/securityUtils`): Imported utility function that handles client-side filtering based on status, date, and search term.

## Context Usage

- None apparent in the provided code snippet. `useAuth` is imported but not used directly.

## Key Components Rendered

- [`VisitorStats`](../components/visitor/VisitorStats.md)
- [`FilterTabs`](../components/common/FilterTabs.md)
- [`SearchBar`](../components/common/SearchBar.md)
- [`VisitorTable`](../components/visitor/VisitorTable.md)
- [`NoResults`](../components/common/NoResults.md) (conditionally rendered)

## API Usage

- `securityApi.getVisitors()`

## Constants

- `VISITOR_FILTER_TABS`: An array defining the labels and values for the status filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaUserFriends`, `FaFilter`
- `../services/apiService`: `securityApi`
- `../utils/securityUtils`: `filterVisitors`
- Multiple components from `/src/components/common` and `/src/components/visitor`
