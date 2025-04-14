# Hostels Page (`/src/pages/admin/Hostels.jsx`)

This page provides administrators with the interface to manage hostel information within the system.

## Route

Likely corresponds to the `/admin/hostels` route.

## Purpose and Functionality

1.  **Display Hostels:** Fetches all hostel data using `adminApi.getAllHostels` and displays each hostel using the [`HostelCard`](../../components/admin/hostel/HostelCard.md) component in a grid layout.
2.  **Data Fetching:** Fetches the full list of hostels on component mount using `useEffect` and `adminApi.getAllHostels`.
3.  **Filtering & Searching:**
    - Uses [`FilterTabs`](../../components/common/FilterTabs.md) to filter hostels, likely by type (e.g., Boys, Girls, All - defined in `HOSTEL_FILTER_TABS`).
    - Includes a [`SearchBar`](../../components/common/SearchBar.md) for text-based searching.
    - Filtering logic is handled client-side by the imported utility function `filterHostels` (from `../../utils/adminUtils`).
4.  **Statistics:** Displays overall hostel statistics using the [`HostelStats`](../../components/admin/hostel/HostelStats.md) component.
5.  **Add Hostel:**
    - An "Add Hostel" button opens the [`AddHostelModal`](../../components/admin/hostel/AddHostelModal.md).
    - Successful hostel addition in the modal triggers a refetch of the hostel list (`fetchHostels`).
6.  **Update Hostel:**
    - The `HostelCard` component likely contains controls to trigger updates.
    - The `handleUpdateHostel` function is passed down to `HostelCard` and calls `adminApi.updateHostel` when an update is needed, followed by a refetch.
7.  **State Management:** Uses `useState` to manage the full list of hostels, the active filter tab, the search term, and the visibility of the add hostel modal.
8.  **UI Feedback:** Displays a [`NoResults`](../../components/common/NoResults.md) component if no hostels match the current filter and search criteria.

## Utility Functions

- `filterHostels(hostels, filter, searchTerm)` (from `../../utils/adminUtils`): Imported utility function that handles client-side filtering based on type/tab and search term.

## Context Usage

- None apparent in the provided code snippet.

## Key Components Rendered

- [`HostelStats`](../../components/admin/hostel/HostelStats.md)
- [`FilterTabs`](../../components/common/FilterTabs.md)
- [`SearchBar`](../../components/common/SearchBar.md)
- [`HostelCard`](../../components/admin/hostel/HostelCard.md) (multiple instances)
- [`NoResults`](../../components/common/NoResults.md) (conditionally rendered)
- [`AddHostelModal`](../../components/admin/hostel/AddHostelModal.md) (conditionally rendered)

## API Usage

- `adminApi.getAllHostels()`
- `adminApi.updateHostel(id, data)`

## Constants

- `HOSTEL_FILTER_TABS` (from `../../constants/adminConstants`): An array defining the labels and values for the filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaPlus`
- `../../services/apiService`: `adminApi`
- `../../utils/adminUtils`: `filterHostels`
- `../../constants/adminConstants`
- Multiple components from `../../components/common` and `../../components/admin/hostel`
