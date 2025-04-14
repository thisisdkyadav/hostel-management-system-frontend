# Security Logins Page (`/src/pages/admin/SecurityLogins.jsx`)

This page provides administrators with the interface to manage Security Staff members and their login credentials.

## Route

Likely corresponds to the `/admin/security-logins` route.

## Purpose and Functionality

1.  **Display Security Staff:** Fetches all security staff data using `adminApi.getAllSecurityLogins` and displays each staff member using the [`SecurityCard`](../../components/admin/security/SecurityCard.md) component in a grid layout.
2.  **Data Fetching:** Fetches the full list of staff on component mount using `useEffect` and `adminApi.getAllSecurityLogins`.
3.  **Filtering & Searching:**
    - Uses [`FilterTabs`](../../components/common/FilterTabs.md) to filter staff, likely by status (e.g., Active, Inactive, All - defined in `SECURITY_FILTER_TABS`).
    - Includes a [`SearchBar`](../../components/common/SearchBar.md) for text-based searching (name or assigned hostel).
    - Filtering logic is handled client-side by the imported utility function `filterSecurity` (from `../../utils/adminUtils`).
4.  **Statistics:** Displays overall staff statistics using the [`SecurityStats`](../../components/admin/security/SecurityStats.md) component.
5.  **Add Security Staff:**
    - An "Add Security" button opens the [`AddSecurityModal`](../../components/admin/security/AddSecurityModal.md).
    - Successful staff addition in the modal triggers a refetch of the staff list (`fetchSecurityStaff`).
6.  **Update/Delete Staff:**
    - The `SecurityCard` component likely contains controls to trigger updates or deletions.
    - The `fetchSecurityStaff` function is passed down as `onUpdate` and `onDelete` props, indicating that modifications within the card trigger a full refetch of the list.
7.  **State Management:** Uses `useState` to manage the full list of staff, the active filter status, the search term, and the visibility of the add staff modal.
8.  **UI Feedback:** Displays a [`NoResults`](../../components/common/NoResults.md) component if no staff match the current filter and search criteria.

## Utility Functions

- `filterSecurity(staff, filterStatus, searchTerm)` (from `../../utils/adminUtils`): Imported utility function that handles client-side filtering based on status and search term.

## Context Usage

- **`useAdmin`** (from `../../contexts/AdminProvider`):
  - `hostelList`: Likely used within the `AddSecurityModal` or `SecurityCard` to provide hostel assignment options, although not directly used in this page component itself.

## Key Components Rendered

- [`SecurityStats`](../../components/admin/security/SecurityStats.md)
- [`FilterTabs`](../../components/common/FilterTabs.md)
- [`SearchBar`](../../components/common/SearchBar.md)
- [`SecurityCard`](../../components/admin/security/SecurityCard.md) (multiple instances)
- [`NoResults`](../../components/common/NoResults.md) (conditionally rendered)
- [`AddSecurityModal`](../../components/admin/security/AddSecurityModal.md) (conditionally rendered)

## API Usage

- `adminApi.getAllSecurityLogins()`
- (Update/Delete API calls are likely made within `SecurityCard` or its sub-components)

## Constants

- `SECURITY_FILTER_TABS` (from `../../constants/adminConstants`): An array defining the labels and values for the filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaUserShield`, `FaPlus`
- `../../contexts/AdminProvider`
- `../../services/apiService`: `adminApi`
- `../../utils/adminUtils`: `filterSecurity`
- `../../constants/adminConstants`
- Multiple components from `../../components/common` and `../../components/admin/security`
