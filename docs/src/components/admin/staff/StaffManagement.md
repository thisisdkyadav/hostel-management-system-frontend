# Staff Management Component (`/src/components/admin/staff/StaffManagement.jsx`)

This is a generic component designed to manage different types of staff members (e.g., Wardens, Associate Wardens) within the admin interface.

## Purpose and Functionality

1.  **Staff Type Configuration:** Accepts a `staffType` prop (defaulting to "warden") to determine the specific type of staff being managed.
2.  **Data Fetching:**
    - Calls the appropriate API endpoint based on `staffType` (`adminApi.getAllWardens` or `adminApi.getAllAssociateWardens`) using the `fetchStaff` function.
    - Fetches data on component mount and when the `staffType` prop changes.
3.  **Display Staff:**
    - Displays statistics using the [`WardenStats`](../wardens/WardenStats.md) component, passing the `staffType`.
    - Renders a list of staff members using the [`WardenCard`](../wardens/WardenCard.md) component in a grid layout, passing `staffType` and callbacks (`onUpdate`, `onDelete`) which trigger `fetchStaff`.
4.  **Filtering & Searching:**
    - Uses [`FilterTabs`](../../common/FilterTabs.md) to filter staff based on status (using `WARDEN_FILTER_TABS` constants).
    - Includes a [`SearchBar`](../../common/SearchBar.md) for text-based searching (name or hostel).
    - Filtering logic is handled client-side by the imported utility function `filterWardens` (Note: This function name might be misleading if used for non-warden staff types).
5.  **Add Staff:**
    - An "Add [Staff Type]" button opens the [`AddWardenModal`](../wardens/AddWardenModal.md), passing the `staffType`.
    - Successful addition triggers a refetch (`fetchStaff`).
6.  **State Management:** Uses `useState` to manage the search term, filter status, modal visibility, and the list of staff members.
7.  **UI Feedback:** Displays a [`NoResults`](../../common/NoResults.md) component when no staff match the criteria.

## Props

- `staffType` (String, optional, default: `'warden'`): Determines the type of staff to manage (e.g., "warden", "associateWarden"). This controls API calls, titles, and potentially the behavior of child components.

## Context Usage

- `useAdmin` (from `../../../contexts/AdminProvider`): Imported but not directly used in this component's logic (might be used by child components like `AddWardenModal`).

## Key Components Rendered

- [`WardenStats`](../wardens/WardenStats.md)
- [`FilterTabs`](../../common/FilterTabs.md)
- [`SearchBar`](../../common/SearchBar.md)
- [`WardenCard`](../wardens/WardenCard.md) (multiple instances)
- [`NoResults`](../../common/NoResults.md) (conditionally rendered)
- [`AddWardenModal`](../wardens/AddWardenModal.md) (conditionally rendered)

## API Usage

- `adminApi.getAllWardens()` (if `staffType` is "warden")
- `adminApi.getAllAssociateWardens()` (if `staffType` is not "warden")

## Utility Functions

- `filterWardens(staffList, filterStatus, searchTerm)` (from `../../../utils/adminUtils`): Handles client-side filtering.

## Constants

- `WARDEN_FILTER_TABS` (from `../../../constants/adminConstants`): Defines the filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaUserTie`, `FaPlus`
- `../../../contexts/AdminProvider`
- `../../../services/apiService`: `adminApi`
- `../../../utils/adminUtils`: `filterWardens`
- `../../../constants/adminConstants`
- `../../common/FilterTabs`
- `../../common/SearchBar`
- `../../common/NoResults`
- `../wardens/WardenCard`
- `../wardens/AddWardenModal`
- `../wardens/WardenStats`
