# Existing Rooms List Component (`/src/components/admin/hostel/rooms/ExistingRoomsList.jsx`)

This component is displayed within the `RoomManagementModal` and is responsible for fetching, displaying, and managing the existing rooms for a given hostel.

## Purpose and Functionality

1.  **Data Fetching:**
    - Calls `fetchRooms` on component mount and when the `hostel` prop changes.
    - `fetchRooms` calls the `hostelApi.getRoomsForEdit(hostel.id)` endpoint to retrieve the list of rooms.
    - Sets the `rooms` and `filteredRooms` state with the fetched data.
    - Manages loading state using the `setIsLoading` prop.
2.  **Filtering and Searching:**
    - Provides a search input field (`searchTerm` state) to filter rooms by number (or unit-number combination if `isUnitBased`).
    - Provides a dropdown (`statusFilter` state) to filter rooms by status (Active, Inactive, Maintenance).
    - The `applyFilters` function (triggered by changes in `rooms`, `searchTerm`, or `statusFilter`) updates the `filteredRooms` state based on the current criteria.
3.  **Room Display:**
    - Renders a table displaying the `filteredRooms`.
    - Columns include Unit (if `isUnitBased`), Room, Capacity, Status (with a styled badge), and Actions.
    - Shows a message if no rooms match the current filters.
4.  **Individual Room Actions:**
    - **Edit:** An edit icon button in each row calls `handleEditRoom`, which sets the `selectedRoom` state and opens the [`EditRoomModal`](./EditRoomModal.md).
    - **Save Update:** The `handleRoomUpdated` function is passed as `onSave` to `EditRoomModal`. It calls `hostelApi.updateRoom` with the updated room data, updates the local `rooms` state on success, calls `onRoomsUpdated`, and closes the modal.
    - **Delete:** The `handleDeleteRoom` function is passed as `onDelete` to `EditRoomModal`. **(Note:** The delete trigger in `EditRoomModal` seems commented out, but this handler exists). It requires `confirmDelete` state (which doesn't seem to be set by the current flow) and calls `adminApi.deleteRoom` with the room ID, updates local state, and calls `onRoomsUpdated`.
5.  **Bulk Update Action:**
    - A "Bulk Update via CSV" button opens the [`BulkUpdateRoomsModal`](./BulkUpdateRoomsModal.md).
    - The `handleBulkUpdateComplete` function is passed as `onRoomsUpdated` to the bulk modal. When called, it refetches the room list (`fetchRooms`) and calls the parent's `onRoomsUpdated` callback.

## Props

- `hostel` (Object): The hostel object whose rooms are being listed and managed. Used for `id` and `type`.
- `onRoomsUpdated` (Function): Callback function invoked after rooms have been successfully added (via other tabs), updated (individually or bulk), or deleted. Signals the parent component (`RoomManagementModal`) that data has changed.
- `setIsLoading` (Function): Callback function provided by the parent (`RoomManagementModal`) to indicate loading status (e.g., during API calls).

## State Management

- `rooms` (Array): The complete list of rooms fetched from the API.
- `filteredRooms` (Array): The subset of `rooms` currently displayed after filtering/searching.
- `searchTerm` (String): Current value of the search input.
- `statusFilter` (String): Current value of the status filter dropdown ('all', 'Active', 'Inactive', 'Maintenance').
- `selectedRoom` (Object | null): The room object currently being edited in the `EditRoomModal`.
- `showEditModal` (Boolean): Controls the visibility of the `EditRoomModal`.
- `showBulkUpdateModal` (Boolean): Controls the visibility of the `BulkUpdateRoomsModal`.
- `confirmDelete` (String | null): Intended to hold the ID of the room awaiting delete confirmation (currently seems unused).

## Key Components Rendered

- [`Button`](../../../common/Button.md)
- [`EditRoomModal`](./EditRoomModal.md) (conditionally)
- [`BulkUpdateRoomsModal`](./BulkUpdateRoomsModal.md) (conditionally)

## API Usage

- `hostelApi.getRoomsForEdit(hostelId)`: Fetches the initial list of rooms.
- `hostelApi.updateRoom(hostelId, roomId, updatedRoomData)`: Updates a single room.
- `adminApi.deleteRoom(hostelId, roomId)`: Deletes a single room.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaEdit`, `FaTrash`, `FaSearch`, `FaFilter`, `FaFileUpload`
- `../../../common/Button`
- `./EditRoomModal`
- `./BulkUpdateRoomsModal`
- `../../../../services/apiService`: `adminApi`
- `../../../../services/hostelApi`
