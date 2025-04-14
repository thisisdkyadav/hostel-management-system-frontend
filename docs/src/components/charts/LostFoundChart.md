# Lost & Found Chart Component (`/src/components/charts/LostFoundChart.jsx`)

This component renders a Doughnut chart to visualize the status of lost and found items (active vs. claimed).

## Purpose and Functionality

1.  **Chart Initialization:** Registers necessary elements (`ArcElement`, `Tooltip`, `Legend`) from `chart.js`.
2.  **Data Preparation:**
    - Takes a `lostFoundStats` object as a prop.
    - Defines the chart `data` structure:
      - Labels: "Active Items", "Claimed Items".
      - Dataset: Uses values from `lostFoundStats.active` and `lostFoundStats.claimed` (defaulting to 0).
      - Assigns specific background colors (yellow, green) and border settings.
3.  **Chart Configuration:**
    - Defines the chart `options`:
      - `responsive`: True, `maintainAspectRatio`: False.
      - `plugins.legend`: Positions the legend at the bottom with point-style labels.
      - `plugins.tooltip`: Customizes the tooltip to show the label, raw value, and percentage.
      - `cutout`: Sets the doughnut hole size to "65%".
4.  **Rendering:**
    - Uses the [`ChartCard`](./ChartCard.md) component as a wrapper, providing a title ("Lost & Found Items Status") and an icon.
    - Renders the `Doughnut` chart component from `react-chartjs-2` within the `ChartCard`.

## Props

- `lostFoundStats` (Object): An object containing item counts. Expected properties: `active` (Number), `claimed` (Number).

## Key Components Rendered

- [`ChartCard`](./ChartCard.md)
- `react-chartjs-2`: `Doughnut`

## Dependencies

- `react`
- `react-chartjs-2`: `Doughnut`
- `chart.js`: `Chart`, `ArcElement`, `Tooltip`, `Legend`
- `./ChartCard`
- `react-icons/fi`: `FiSearch`
