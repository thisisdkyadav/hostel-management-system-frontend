# Hostel Statistics Component (`/src/components/admin/hostel/HostelStats.jsx`)

This component calculates and displays key aggregate statistics derived from a list of all hostels.

## Purpose and Functionality

1.  **Data Aggregation:** Takes an array of `hostels` as input.
2.  **Calculation:** Computes the following statistics from the `hostels` array:
    - Total number of hostels (`totalHostels`).
    - Sum of `totalRooms` across all hostels.
    - Overall `occupancyRate` (calculated as total occupied rooms / total rooms \* 100). Handles division by zero, defaulting to 0%.
    - Total number of `availableRooms` (total rooms - total occupied rooms).
3.  **Data Formatting:** Structures the calculated statistics into an array (`statsData`) where each object defines the `title`, `value`, `subtitle`, `icon`, and `color` for a single stat card.
4.  **Rendering:** Passes the formatted `statsData` array to the reusable [`StatCards`](../../common/StatCards.md) component for display.

## Props

- `hostels` (Array): An array of hostel objects. Each object in the array is expected to have at least the following properties used for calculations:
  - `totalRooms` (Number)
  - `occupiedRooms` (Number)

## Key Components Rendered

- [`StatCards`](../../common/StatCards.md)

## Dependencies

- `../../common/StatCards`
- `react-icons/fa`: `FaBuilding`, `FaBed`
- `react-icons/md`: `MdOutlinePersonOutline`
- `react-icons/gi`: `GiVacuumCleaner`
