# Room Change Requests Chart Component (`/src/components/charts/RoomChangeRequestsChart.jsx`)

This component renders a Doughnut chart to visualize the status breakdown of room change requests.

## Purpose and Functionality

1.  **Chart Initialization:** Registers necessary elements (`ArcElement`, `Tooltip`, `Legend`) from `chart.js`.
2.  **Data Preparation:**
    - Takes a `roomChangeStats` object as a prop.
    - Defines the chart `data` structure:
      - Labels: "Pending", "Approved", "Rejected".
      - Dataset: Uses values from `roomChangeStats.pending`, `roomChangeStats.approved`, and `roomChangeStats.rejected` (defaulting to 0).
      - Assigns specific background colors (orange, green, red) and border settings.
3.  **Chart Configuration:**
    - Defines the chart `options`:
      - `responsive`: True, `maintainAspectRatio`: False.
      - `plugins.legend`: Positions the legend at the bottom with point-style labels.
      - `plugins.tooltip`: Customizes the tooltip to show the label, raw value, and percentage.
      - `cutout`: Sets the doughnut hole size to "65%".
4.  **Rendering:**
    - Uses the [`ChartCard`](./ChartCard.md) component as a wrapper, providing a title ("Room Change Requests Status") and an icon.
    - Renders the `Doughnut` chart component from `react-chartjs-2` within the `ChartCard`.

## Props

- `roomChangeStats` (Object): An object containing request counts. Expected properties: `pending` (Number), `approved` (Number), `rejected` (Number).

## Key Components Rendered

- [`ChartCard`](./ChartCard.md)
- `react-chartjs-2`: `Doughnut`

## Dependencies

- `react`
- `react-chartjs-2`: `Doughnut`
- `chart.js`: `Chart`, `ArcElement`, `Tooltip`, `Legend`
- `./ChartCard`
- `react-icons/md`: `MdChangeCircle`
