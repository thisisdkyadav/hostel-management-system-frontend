# Security Staff Statistics Component (`/src/components/admin/security/SecurityStats.jsx`)

This component calculates and displays key aggregate statistics derived from a list of security staff members.

## Purpose and Functionality

1.  **Data Aggregation:** Takes an array of `securityStaff` objects as input.
2.  **Calculation:** Computes the following statistics from the `securityStaff` array:
    - Total number of security staff (`totalSecurity`).
    - Number of staff assigned to a hostel (`assignedSecurity`, based on the presence of `s.hostelId`).
    - Number of staff not assigned (`unassignedSecurity`).
    - **(Note:** Calculations for shift distribution (`morningShifts`, `eveningShifts`, `nightShifts`) and `mostCommonShift` exist but the corresponding stat card is commented out in the provided code).
3.  **Data Formatting:** Structures the calculated statistics (Total, Assigned, Unassigned) into an array (`statsData`) where each object defines the `title`, `value`, `subtitle`, `icon`, and `color` for a single stat card.
4.  **Rendering:** Passes the formatted `statsData` array to the reusable [`StatCards`](../../common/StatCards.md) component for display, specifying 3 columns.

## Props

- `securityStaff` (Array): An array of security staff objects. Each object is expected to have at least the following properties:
  - `hostelId` (String | null | undefined): Used to determine assignment status.
  - `shift` (String, optional, currently unused for display): e.g., 'morning', 'evening', 'night'.

## Key Components Rendered

- [`StatCards`](../../common/StatCards.md)

## Dependencies

- `../../common/StatCards`
- `react-icons/fa`: `FaUserShield`, `FaBuilding`
- `react-icons/md`: `MdVerified`
- `react-icons/io`: `IoMdTime` (Imported but stat card using it is commented out)
