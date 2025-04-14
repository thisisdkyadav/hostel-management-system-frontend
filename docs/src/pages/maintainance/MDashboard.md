# Maintenance Dashboard Page (`/src/pages/maintainance/MDashboard.jsx`)

This page serves as the main dashboard interface for Maintenance Staff users.

## Route

Likely corresponds to the `/maintenance` or `/maintenance/dashboard` route.

## Purpose and Functionality

1.  **Display Complaints:** The primary purpose is to display maintenance complaints relevant to the logged-in staff member.
2.  **Filtering:**
    - Renders [`FilterTabs`](../../components/common/FilterTabs.md) using filter definitions from `MAINTENANCE_FILTER_TABS` (constants). This likely allows filtering complaints by status (e.g., Pending, In Progress, Resolved) or maybe category.
    - The selected `activeTab` state is passed down as a `filterTab` prop to the `ComplaintsM` component.
3.  **Complaint Component:** Renders the [`ComplaintsM`](../../components/maintenance/ComplaintsM.md) component, which is responsible for fetching and displaying the actual complaint data based on the selected filter.
4.  **Header:** Includes a simple header displaying the page title and the logged-in user's name and role.

## Context Usage

- **`useAuth`** (from `../../contexts/AuthProvider`):
  - `user`: To display the user's name and role in the header.

## Key Components Rendered

- [`FilterTabs`](../../components/common/FilterTabs.md)
- [`ComplaintsM`](../../components/maintenance/ComplaintsM.md)

## Constants

- `MAINTENANCE_FILTER_TABS` (from `../../constants/adminConstants`): Defines the tabs used for filtering complaints.

## Dependencies

- `react`: `useState`
- `react-icons/fa`: `FaUser`
- `../../contexts/AuthProvider`
- `../../constants/adminConstants`
- `../../components/maintenance/ComplaintsM`
- `../../components/common/FilterTabs`
