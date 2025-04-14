# Hostel List Item Component (`/src/components/admin/hostel/HostelListItem.jsx`)

This component renders a single row or item representing a hostel, typically used within a list or table view in the admin dashboard.

## Purpose and Functionality

1.  **Data Display:**
    - Shows the hostel's name prominently.
    - Displays key details using badges: Gender, Type (Unit-based or Room-only), total Room count, and total Capacity.
2.  **Action Buttons:** Provides buttons for common actions:
    - **Manage Rooms:** Opens the [`RoomManagementModal`](./RoomManagementModal.md) to allow managing rooms for this specific hostel.
    - **Edit:** Opens the [`EditHostelModal`](./EditHostelModal.md) to modify the hostel's basic details (name, gender).
    - **Delete:** Triggers the `onDelete` prop function, passing the `hostel.id`.
3.  **Modal Handling:**
    - Uses `useState` (`showEditModal`, `showRoomManagementModal`) to control the visibility of the respective modals.
    - When the `EditHostelModal` saves, it calls the `onUpdate` prop and closes the modal.
    - When the `RoomManagementModal` indicates rooms were updated (`onRoomsUpdated`), it calls the `onUpdate` prop (passing the existing `hostel` object, effectively just signaling a change) and closes the modal.

## Props

- `hostel` (Object): An object containing the hostel's details. Expected properties include:
  - `id` (String/Number): Unique identifier for the hostel.
  - `name` (String): Hostel name.
  - `gender` (String)
  - `type` (String: 'unit-based' or 'room-only')
  - `rooms` (Array, optional): Used to get the length for display.
  - `totalCapacity` (Number, optional)
- `onUpdate` (Function): A callback function invoked when the hostel's details are successfully updated via the Edit modal or when rooms are updated via the Room Management modal. It receives the updated `hostel` object from the Edit modal, or the original `hostel` object from the Room Management modal (signaling a related data change).
- `onDelete` (Function): A callback function invoked when the delete button is clicked. It receives the `hostel.id` as an argument.

## State Management

- `showEditModal` (Boolean): Controls the visibility of the `EditHostelModal`.
- `showRoomManagementModal` (Boolean): Controls the visibility of the `RoomManagementModal`.

## Key Components Rendered

- [`Button`](../../common/Button.md)
- [`EditHostelModal`](./EditHostelModal.md) (conditionally)
- [`RoomManagementModal`](./RoomManagementModal.md) (conditionally)

## Dependencies

- `react`: `useState`
- `react-icons/fa`: `FaEdit`, `FaTrash`, `FaDoorOpen`
- `./EditHostelModal`
- `./RoomManagementModal`
- `../../common/Button`
