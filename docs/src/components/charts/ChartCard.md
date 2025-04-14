# Chart Card Component (`/src/components/charts/ChartCard.jsx`)

This is a simple presentational wrapper component used to display a chart within a card-like structure, providing a consistent title format.

## Purpose and Functionality

1.  **Title Display:** Renders an `<h2>` element with the provided `title`.
2.  **Icon Display:** Conditionally renders an optional `icon` (expected to be a React element, like an icon component) before the title.
3.  **Content Area:** Renders the `children` prop within a `div`. This is where the actual chart component (e.g., from a charting library) is expected to be placed.
4.  **Styling:** Applies basic styling for the title (font size, weight, color, margin) and sets a fixed height (`h-64`) for the content area.

## Props

- `title` (String): The title to be displayed above the chart.
- `icon` (React.ReactNode, optional): An optional icon element to display next to the title.
- `children` (React.ReactNode): The content to be rendered within the card, typically a chart component.

## Dependencies

- `react`
