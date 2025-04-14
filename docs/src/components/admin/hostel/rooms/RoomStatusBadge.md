# Room Status Badge Component (`/src/components/admin/hostel/rooms/RoomStatusBadge.jsx`)

This is a simple presentational component used to display a room's status as a colored badge.

## Purpose and Functionality

1.  **Status Input:** Accepts a `status` string as a prop.
2.  **Style Determination:** Uses an internal helper function `getBadgeStyles` to determine the appropriate Tailwind CSS classes (background and text color) based on the `status` value.
    - Maps specific statuses ("Active", "Inactive", "Maintenance", "Occupied", "Reserved") to corresponding color combinations (green, gray, yellow, blue, purple).
    - Defaults to gray for any unrecognized status.
3.  **Rendering:** Renders a `<span>` element containing the `status` text, styled with the determined badge classes.

## Props

- `status` (String): The status of the room (e.g., "Active", "Inactive", "Maintenance", "Occupied", "Reserved").

## Dependencies

- `react`
