# Warden Statistics Component (`/src/components/admin/wardens/WardenStats.jsx`)

This component calculates and displays key aggregate statistics for either Wardens or Associate Wardens.

## Purpose and Functionality

1.  **Staff Type Handling:** Accepts a `staffType` prop ('warden' or other, defaulting to 'warden') to customize titles and subtitles displayed on the stat cards.
2.  **Data Aggregation:** Takes an array of `wardens` objects as input.
3.  **Calculation:** Computes the following statistics from the `wardens` array:
    - Total number of staff (`totalWardens`).
    - Number of staff assigned to at least one hostel (`assignedWardens`, based on `w.hostelIds && w.hostelIds.length > 0`).
    - Number of staff not assigned (`unassignedWardens`).
4.  **Data Formatting:** Structures the calculated statistics into an array (`statsData`) where each object defines the `title` (customized by `staffType`), `value`, `subtitle` (customized by `staffType`), `icon`, and `color` for a single stat card.
5.  **Rendering:** Passes the formatted `statsData` array to the reusable [`StatCards`](../../common/StatCards.md) component for display, specifying 3 columns.

## Props

- `wardens` (Array): An array of warden or associate warden objects. Each object is expected to have an `hostelIds` property (Array) to determine assignment status.
- `staffType` (String, optional): Defaults to 'warden'. Used to customize text labels.

## Key Components Rendered

- [`StatCards`](../../common/StatCards.md)

## Dependencies

- `../../common/StatCards`
- `react-icons/fa`: `FaUsers`, `FaBuilding`
- `react-icons/md`: `MdVerified`
