# Maintenance Breakdown Chart Component (`/src/components/charts/MaintenanceBreakdownChart.jsx`)

This component renders a Pie chart to visualize the distribution of maintenance staff across different specialty categories.

## Purpose and Functionality

1.  **Chart Initialization:** Registers necessary elements (`ArcElement`, `Tooltip`, `Legend`) from `chart.js`.
2.  **Data Preparation:**
    - Takes a `maintenanceStats` object as a prop.
    - Defines the chart `data` structure:
      - Labels: "Plumbing", "Electrical", "Cleanliness", "Internet", "Civil".
      - Dataset: Uses values from corresponding properties in `maintenanceStats` (e.g., `maintenanceStats.plumbing`), defaulting to 0.
      - Assigns specific background colors and border settings.
3.  **Chart Configuration:**
    - Defines the chart `options`:
      - `responsive`: True, `maintainAspectRatio`: False.
      - `plugins.legend`: Positions the legend to the right with point-style labels.
      - `plugins.tooltip`: Customizes the tooltip to show the label, raw value, and percentage.
4.  **Rendering:**
    - Renders a `div` containing:
      - A title "Maintenance Team Breakdown" with an icon.
      - A fixed-height `div` (`h-64`) where the `Pie` chart component is rendered.
      - Renders an optional `subtitle` element passed as a prop below the chart.

## Props

- `maintenanceStats` (Object): An object containing counts for each maintenance category. Expected properties: `plumbing`, `electrical`, `cleanliness`, `internet`, `civil` (all Numbers).
- `subtitle` (React.ReactNode, optional): An optional element to display below the chart.

## Dependencies

- `react`
- `react-chartjs-2`: `Pie`
- `chart.js`: `Chart`, `ArcElement`, `Tooltip`, `Legend`
- `react-icons/fa`: `FaTools`
