# Maintenance Staff Page (`/src/pages/admin/MaintenanceStaff.jsx`)

This page provides administrators with the interface to manage Maintenance Staff members.

## Route

Likely corresponds to the `/admin/maintenance-staff` route.

## Purpose and Functionality

1.  **Display Staff:** Fetches all maintenance staff data using `adminApi.getAllMaintenanceStaff` and displays each staff member using the [`MaintenanceCard`](../../components/admin/maintenance/MaintenanceCard.md) component in a grid layout.
2.  **Data Fetching:** Fetches the full list of staff on component mount using `useEffect` and `adminApi.getAllMaintenanceStaff`.
3.  **Filtering & Searching:**
    - Uses [`FilterTabs`](../../components/common/FilterTabs.md) to filter staff by their maintenance category (e.g., Plumbing, Electrical, All - defined in `MAINTENANCE_FILTER_TABS`).
    - Includes a [`SearchBar`](../../components/common/SearchBar.md) for text-based searching (name or category).
    - Filtering logic is handled client-side by the imported utility function `filterMaintenanceStaff` (from `../../utils/adminUtils`).
4.  **Statistics:** Displays overall staff statistics using the [`MaintenanceStats`](../../components/admin/maintenance/MaintenanceStats.md) component.
5.  **Add Staff:**
    - An "Add Staff" button opens the [`AddMaintenanceModal`](../../components/admin/maintenance/AddMaintenanceModal.md).
    - Successful staff addition in the modal triggers a refetch of the staff list (`fetchMaintenanceStaff`).
6.  **Update/Delete Staff:**
    - The `MaintenanceCard` component likely contains controls to trigger updates or deletions.
    - The `fetchMaintenanceStaff` function is passed down as `onUpdate` and `onDelete` props, indicating that modifications within the card trigger a full refetch of the list.
7.  **State Management:** Uses `useState` to manage the full list of staff, the active filter category, the search term, and the visibility of the add staff modal.
8.  **UI Feedback:** Displays a [`NoResults`](../../components/common/NoResults.md) component if no staff match the current filter and search criteria.

## Utility Functions

- `filterMaintenanceStaff(staff, filterCategory, searchTerm)` (from `../../utils/adminUtils`): Imported utility function that handles client-side filtering based on category and search term.

## Context Usage

- None apparent in the provided code snippet.

## Key Components Rendered

- [`MaintenanceStats`](../../components/admin/maintenance/MaintenanceStats.md)
- [`FilterTabs`](../../components/common/FilterTabs.md)
- [`SearchBar`](../../components/common/SearchBar.md)
- [`MaintenanceCard`](../../components/admin/maintenance/MaintenanceCard.md) (multiple instances)
- [`NoResults`](../../components/common/NoResults.md) (conditionally rendered)
- [`AddMaintenanceModal`](../../components/admin/maintenance/AddMaintenanceModal.md) (conditionally rendered)

## API Usage

- `adminApi.getAllMaintenanceStaff()`
- (Update/Delete API calls are likely made within `MaintenanceCard` or its sub-components)

## Constants

- `MAINTENANCE_FILTER_TABS` (from `../../constants/adminConstants`): An array defining the labels and values for the filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaTools`, `FaPlus`
- `../../services/apiService`: `adminApi`
- `../../utils/adminUtils`: `filterMaintenanceStaff`
- `../../constants/adminConstants`
- Multiple components from `../../components/common` and `../../components/admin/maintenance`
