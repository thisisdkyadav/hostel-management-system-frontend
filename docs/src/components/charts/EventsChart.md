# Events Chart Component (`/src/components/charts/EventsChart.jsx`)

This component renders a Pie chart to visualize the breakdown between upcoming and past events.

## Purpose and Functionality

1.  **Chart Initialization:** Registers necessary elements (`ArcElement`, `Tooltip`, `Legend`) from `chart.js`.
2.  **Data Preparation:**
    - Takes an `eventStats` object as a prop.
    - Defines the chart `data` structure for `react-chartjs-2`:
      - Labels: "Upcoming Events", "Past Events".
      - Dataset: Uses values from `eventStats.upcoming` and `eventStats.past` (defaulting to 0).
      - Assigns specific background colors (indigo, purple) and border settings.
3.  **Chart Configuration:**
    - Defines the chart `options`:
      - `responsive`: True, `maintainAspectRatio`: False.
      - `plugins.legend`: Positions the legend at the bottom with point-style labels.
      - `plugins.tooltip`: Customizes the tooltip to show the label, raw value, and percentage.
4.  **Rendering:**
    - Uses the [`ChartCard`](./ChartCard.md) component as a wrapper, providing a title ("Events Timeline") and an icon.
    - Renders the `Pie` chart component from `react-chartjs-2` within the `ChartCard`, passing the prepared `data` and `options`.

## Props

- `eventStats` (Object): An object containing event counts. Expected properties: `upcoming` (Number), `past` (Number).

## Key Components Rendered

- [`ChartCard`](./ChartCard.md)
- `react-chartjs-2`: `Pie`

## Dependencies

- `react`
- `react-chartjs-2`: `Pie`
- `chart.js`: `Chart`, `ArcElement`, `Tooltip`, `Legend`
- `./ChartCard`
- `react-icons/bi`: `BiCalendarEvent`
