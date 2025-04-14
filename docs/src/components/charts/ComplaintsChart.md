# Complaints Chart Component (`/src/components/charts/ComplaintsChart.jsx`)

This component renders a Doughnut chart to visualize the status breakdown of complaints.

## Purpose and Functionality

1.  **Chart Initialization:** Registers necessary elements (`ArcElement`, `Tooltip`, `Legend`) from `chart.js`.
2.  **Data Preparation:**
    - Takes a `complaintsStats` object as a prop, which is expected to contain counts for different statuses.
    - Defines the chart `data` structure for `react-chartjs-2`:
      - Labels: "Pending", "In Process", "Resolved".
      - Dataset: Uses values from `complaintsStats.pending`, `complaintsStats.inProgress`, and `complaintsStats.resolved` (defaulting to 0 if undefined).
      - Assigns specific background colors (yellow, pink, green) and border settings.
3.  **Chart Configuration:**
    - Defines the chart `options`:
      - `responsive`: True, `maintainAspectRatio`: False (to fit the container).
      - `plugins.legend`: Positions the legend at the bottom with point-style labels.
      - `plugins.tooltip`: Customizes the tooltip to show the label, raw value, and percentage.
      - `cutout`: Sets the doughnut hole size to "65%".
4.  **Rendering:**
    - Renders a `div` containing:
      - A title "Complaints Status" with an icon.
      - A fixed-height `div` (`h-64`) where the `Doughnut` chart component from `react-chartjs-2` is rendered with the prepared `data` and `options`.
      - Renders an optional `subtitle` element passed as a prop below the chart.

## Props

- `complaintsStats` (Object): An object containing the counts for complaint statuses. Expected properties: `pending` (Number), `inProgress` (Number), `resolved` (Number).
- `subtitle` (React.ReactNode, optional): An optional element (e.g., text or another component) to display below the chart.

## Dependencies

- `react`
- `react-chartjs-2`: `Doughnut`
- `chart.js`: `Chart`, `ArcElement`, `Tooltip`, `Legend`
- `react-icons/fi`: `FiSettings`
