# Admin Dashboard Page (`/src/pages/admin/Dashboard.jsx`)

This page serves as the main dashboard for administrators, providing a high-level overview of key system statistics and metrics.

## Route

Likely corresponds to the `/admin` or `/admin/dashboard` route.

## Purpose and Functionality

1.  **Data Fetching:**
    - On component mount (`useEffect`), fetches various statistics concurrently using `Promise.all` from the `statsApi` service:
      - `statsApi.getComplaintsStats()`
      - `statsApi.getHostelStats()`
      - `statsApi.getWardenStats()`
      - `statsApi.getSecurityStats()`
      - `statsApi.getMaintenanceStaffStats()`
    - Manages loading and error states during data fetching.
2.  **Statistics Display:**
    - Displays key summary metrics (Total Hostels, Total Rooms, Total Complaints, Total Staff) using the [`StatCards`](../../components/common/StatCards.md) component.
    - Presents detailed breakdowns using various chart components:
      - [`HostelOccupancyChart`](../../components/charts/HostelOccupancyChart.md): Shows hostel occupancy details.
      - [`ComplaintsChart`](../../components/charts/ComplaintsChart.md): Shows complaint status breakdown.
      - [`StaffDistributionChart`](../../components/charts/StaffDistributionChart.md): Shows the distribution of different staff types.
      - [`MaintenanceBreakdownChart`](../../components/charts/MaintenanceBreakdownChart.md): Shows the breakdown of maintenance requests by category.
    - Includes a helper component `StatInfo` to display individual stats below charts.
    - (Commented out section suggests potential for `AssignmentCard` components for staff assignment status).
3.  **Layout:** Arranges the stat cards and charts in a grid layout for a comprehensive overview.

## Context Usage

- **`useAuth`** (from `../../contexts/AuthProvider`):
  - `user`: To display the logged-in admin's name in the header.

## Key Components Rendered

- [`StatCards`](../../components/common/StatCards.md)
- [`HostelOccupancyChart`](../../components/charts/HostelOccupancyChart.md)
- [`ComplaintsChart`](../../components/charts/ComplaintsChart.md)
- [`StaffDistributionChart`](../../components/charts/StaffDistributionChart.md)
- [`MaintenanceBreakdownChart`](../../components/charts/MaintenanceBreakdownChart.md)
- `StatInfo` (local helper component)

## API Usage

- `statsApi.getComplaintsStats()`
- `statsApi.getHostelStats()`
- `statsApi.getWardenStats()`
- `statsApi.getSecurityStats()`
- `statsApi.getMaintenanceStaffStats()`

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons`: `FaUser`, `FaUsers`, `FaUserTie`, `FaUserShield`, `FaBuilding`, `FaTools`, `MdSecurity`, `MdDashboard`, `BiError`, `TbBuildingCommunity`, `FiSettings`, `AiOutlineLoading3Quarters`
- `../../contexts/AuthProvider`
- `../../services/apiService`: `statsApi`
- Multiple components from `../../components/common` and `../../components/charts`
