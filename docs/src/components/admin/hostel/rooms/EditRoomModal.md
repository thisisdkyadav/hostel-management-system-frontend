# Edit Room Modal Component (`/src/components/admin/hostel/rooms/EditRoomModal.jsx`)

This component provides a modal interface for editing the details (primarily capacity and status) of a single existing room. It also includes functionality to delete the room.

## Purpose and Functionality

1.  **Modal Display:** Uses the common `Modal` component.
2.  **Form Initialization:** Initializes the `formData` state with the details from the `room` prop upon mounting.
3.  **Data Display (Non-Editable):** Shows the Unit Number (if `isUnitBased`) and the Room Number/Letter in disabled input fields for context.
4.  **Input Fields (Editable):**
    - **Capacity:** Number input (minimum 1).
    - **Status:** Dropdown select (Active, Inactive, Maintenance).
5.  **State Management:**
    - `formData`: Stores the current values of the room details being edited (including non-editable `id`, `unitNumber`, `roomNumber` passed to `onSave`).
    - `errors`: Stores validation errors (for capacity, status, and general form errors).
    - `isSubmitting`: Tracks the save operation state.
    - `confirmDelete`: Boolean state to switch the modal view to a delete confirmation prompt.
6.  **Input Handling:** `handleChange` updates `formData` (parsing capacity to integer) and clears field-specific errors.
7.  **Client-Side Validation:** `validateForm` checks if capacity is at least 1 and status is selected. Sets `errors` state.
8.  **Save Handling:**
    - `handleSubmit` prevents default, validates the form.
    - Sets `isSubmitting` to true.
    - Calls the `onSave` prop function (provided by the parent, e.g., `ExistingRoomsList`), passing the entire `formData` object.
    - Calls `onClose` upon successful save (assuming `onSave` resolves).
    - Catches errors during `onSave` and displays them.
    - Resets `isSubmitting` in a `finally` block.
9.  **Delete Handling:**
    - **(Note:** The delete button seems commented out in the reviewed code, but the logic exists.)
    - `handleDeleteConfirm`: Sets `confirmDelete` to `true`, switching the modal's content.
    - `handleDeleteRoom`: Calls the `onDelete` prop function (provided by the parent) with the `room.id`.
    - Catches errors during `onDelete` and displays them, resetting `confirmDelete` to `false`.
    - The confirmation view has "Cancel" and "Delete Room" buttons.

## Props

- `room` (Object): The room object containing the details to be edited. Expected properties: `id`, `unitNumber` (optional), `roomNumber`, `capacity`, `status`.
- `isUnitBased` (Boolean): Flag passed from the parent to indicate if the hostel is unit-based, used to conditionally display the Unit Number field.
- `onSave` (Function): An async function provided by the parent. Called with the updated `formData` object when the user saves changes. Should handle the API call to update the room.
- `onDelete` (Function): An async function provided by the parent. Called with the `room.id` when the user confirms deletion. Should handle the API call to delete the room.
- `onClose` (Function): Callback function invoked to close the modal.

## State Management

- `formData` (Object): `{ id, unitNumber, roomNumber, capacity, status }`
- `errors` (Object): `{ capacity?: String, status?: String, form?: String }`
- `isSubmitting` (Boolean)
- `confirmDelete` (Boolean)

## Key Components Rendered

- [`Modal`](../../../common/Modal.md)
- [`Button`](../../../common/Button.md)

## Dependencies

- `react`: `useState`
- `../../../common/Modal`
- `../../../common/Button`
- `react-icons/fa`: `FaDoorOpen`, `FaUsers`, `FaTrash`
