# Staff Distribution Chart Component (`/src/components/charts/StaffDistributionChart.jsx`)

This component renders a Bar chart to visualize the total number of staff members across different categories (Wardens, Security, Maintenance).

## Purpose and Functionality

1.  **Chart Initialization:** Registers necessary elements (`CategoryScale`, `LinearScale`, `BarElement`, `Title`, `Tooltip`, `Legend`) from `chart.js`.
2.  **Data Preparation:**
    - Takes `wardenStats`, `securityStats`, and `maintenanceStats` objects as props.
    - Defines the chart `data` structure:
      - Labels: "Wardens", "Security", "Maintenance".
      - Dataset: Uses the `total` property from each respective stats object (e.g., `wardenStats.total`), defaulting to 0.
      - Assigns specific background colors for the bars.
3.  **Chart Configuration:**
    - Defines the chart `options`:
      - `responsive`: True, `maintainAspectRatio`: False.
      - `plugins.legend`: Positions the legend at the top.
      - `scales.y`: Configures the Y-axis to begin at zero and use integer ticks (`precision: 0`).
4.  **Rendering:**
    - Renders a `div` containing:
      - A title "Staff Distribution" with an icon.
      - A fixed-height `div` (`h-64`) where the `Bar` chart component from `react-chartjs-2` is rendered.
      - Renders an optional `subtitle` element passed as a prop below the chart.

## Props

- `wardenStats` (Object): An object containing warden counts. Expected property: `total` (Number).
- `securityStats` (Object): An object containing security counts. Expected property: `total` (Number).
- `maintenanceStats` (Object): An object containing maintenance counts. Expected property: `total` (Number).
- `subtitle` (React.ReactNode, optional): An optional element to display below the chart.

## Dependencies

- `react`
- `react-chartjs-2`: `Bar`
- `chart.js`: `Chart`, `CategoryScale`, `LinearScale`, `BarElement`, `Title`, `Tooltip`, `Legend`
- `react-icons/fa`: `FaUserTie`
