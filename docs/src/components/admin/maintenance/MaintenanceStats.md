# Maintenance Staff Statistics Component (`/src/components/admin/maintenance/MaintenanceStats.jsx`)

This component calculates and displays key statistics about the maintenance staff, categorized by their specialty.

## Purpose and Functionality

1.  **Data Aggregation:** Takes an array of `maintenanceStaff` objects as input.
2.  **Calculation:**
    - Calculates the total number of staff (`totalStaff`).
    - Uses `reduce` to count the number of staff members in each category (`countByCategory`). It assumes each `staff` object has a `category` property (e.g., "Plumbing", "Electrical", "Civil", "Cleanliness", "Internet", "Other").
3.  **Data Formatting:** Creates an array `statCards` where each object represents a statistic to be displayed. Each object includes:
    - `name`: The name of the statistic (e.g., "Total Staff", "Plumbing").
    - `value`: The calculated count for that statistic.
    - `icon`: A corresponding React icon component.
    - `bgColor`: Tailwind CSS class for the card's background color.
4.  **Rendering:** Maps over the `statCards` array and renders a styled `div` for each statistic, displaying the icon, value, and name within a grid layout.

## Props

- `maintenanceStaff` (Array): An array of maintenance staff objects. Each object is expected to have a `category` property (String) indicating their specialty.

## Dependencies

- `react`
- `react-icons/fa`: `FaTools`, `FaWrench`, `FaBolt`, `FaBuilding`, `FaBroom`, `FaWifi`, `FaEllipsisH`
