# Feedback Stats Component (`/src/components/FeedbackStats.jsx`)

This component calculates and displays summary statistics based on a list of feedback items.

## Purpose and Functionality

1.  **Calculates Statistics:**
    - Takes an array of `feedbacks` objects as input.
    - Calculates the total number of feedbacks.
    - Calculates the number of feedbacks with `status === "Pending"`.
    - Calculates the number of feedbacks with `status === "Seen"`.
    - Determines the date of the most recent feedback submission (`getLatestFeedbackDate` helper function).
2.  **Formats Data:** Prepares an array (`statsData`) suitable for the `StatCards` component, including titles, values, subtitles, icons, and colors for each statistic.
3.  **Renders Statistics:** Renders the calculated statistics using the common [`StatCards`](./common/StatCards.md) component.

## Props

- `feedbacks` (Array): An array of feedback objects. Each object is expected to have at least `status` and `createdAt` properties.

## Key Components Rendered

- [`StatCards`](./common/StatCards.md)

## Dependencies

- `react`
- `react-icons/hi`: `HiAnnotation`, `HiEye`, `HiClipboardList`, `HiClock`
- `./common/StatCards`
