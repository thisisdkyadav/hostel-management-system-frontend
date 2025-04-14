# Hostel Occupancy Chart Component (`/src/components/charts/HostelOccupancyChart.jsx`)

This component renders a Doughnut chart visualizing the occupancy status (occupied vs. available rooms) across all hostels.

## Purpose and Functionality

1.  **Chart Initialization:** Registers necessary elements (`ArcElement`, `Tooltip`, `Legend`) from `chart.js`.
2.  **Data Calculation & Preparation:**
    - Takes a `hostelStats` object as a prop, which is expected to contain overall room counts.
    - Calculates `occupiedRooms` by subtracting `hostelStats.availableRooms` from `hostelStats.totalRooms` (defaulting to 0 if values are missing).
    - Defines the chart `data` structure:
      - Labels: "Occupied", "Available".
      - Dataset: Uses the calculated `occupiedRooms` and `availableRooms`.
      - Assigns specific background colors (blue, green) and border settings.
3.  **Chart Configuration:**
    - Defines the chart `options`:
      - `responsive`: True, `maintainAspectRatio`: False.
      - `plugins.legend`: Positions the legend at the bottom with point-style labels.
      - `plugins.tooltip`: Customizes the tooltip to show the label, raw value, and percentage (calculated based on `totalRooms`).
      - `cutout`: Sets the doughnut hole size to "65%".
4.  **Rendering:**
    - Renders a `div` containing:
      - A title "Hostel Occupancy Status" with an icon.
      - A fixed-height `div` (`h-64`) where the `Doughnut` chart component is rendered.
      - Renders an optional `subtitle` element passed as a prop below the chart.

## Props

- `hostelStats` (Object): An object containing aggregate room counts. Expected properties: `totalRooms` (Number), `availableRooms` (Number).
- `subtitle` (React.ReactNode, optional): An optional element to display below the chart.

## Dependencies

- `react`
- `react-chartjs-2`: `Doughnut`
- `chart.js`: `Chart`, `ArcElement`, `Tooltip`, `Legend`
- `react-icons/tb`: `TbBuildingCommunity`
