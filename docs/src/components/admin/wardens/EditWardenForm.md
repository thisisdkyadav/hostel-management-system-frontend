# Edit Warden Form Component (`/src/components/admin/wardens/EditWardenForm.jsx`)

This component renders a modal containing a form to edit the details (phone, hostel assignments, join date) of an existing Warden or Associate Warden.

## Purpose and Functionality

1.  **Staff Type Handling:** Accepts `staffType` ('warden' or other) to adjust titles and determine which API endpoint to call for updates/deletions.
2.  **Modal Display:** Wraps the form content within a common [`Modal`](../../common/Modal.md) component, including the staff member's name in the title.
3.  **Hostel Data:** Uses the `useAdmin` hook to get the `hostelList` for populating the assignment checkboxes.
4.  **Form Initialization:**
    - Initializes `formData` state with `phone`, `hostelIds`, and `joinDate` from the `warden` prop.
    - Uses `useEffect` hook to re-initialize the form data if the `warden` prop changes.
    - Properly formats the `joinDate` for the date input and extracts hostel IDs from the `hostelIds` array (handling cases where it might contain objects).
5.  **Input Fields:**
    - **Phone Number:** Text input.
    - **Hostel Assignments:** A list of checkboxes, one for each hostel in `hostelList`. Allows assigning the warden to multiple hostels.
    - **Join Date:** Date input.
6.  **State Management:**
    - `formData`: Stores the current values of `phone`, `hostelIds` (array of selected hostel IDs), and `joinDate`.
7.  **Input Handling:** `handleChange` updates `formData`.
    - Special logic for `hostelIds`: If a checkbox is checked, adds the hostel ID to the array; if unchecked, removes it.
8.  **Update Handling:**
    - `handleSubmit` prevents default form submission.
    - Constructs a `payload` with the current `formData`.
    - Calls the appropriate API endpoint based on `staffType` (`adminApi.updateWarden` or `adminApi.updateAssociateWarden`) with the `warden.id` and `payload`.
    - Shows an alert on success or failure.
    - Calls `onSave` prop (if provided) and `onClose` prop on success.
9.  **Delete Handling:**
    - `handleDelete` is triggered by the "Delete" button.
    - Uses `window.confirm` for confirmation.
    - If confirmed, calls the appropriate API endpoint based on `staffType` (`adminApi.deleteWarden` or `adminApi.deleteAssociateWarden`) with the `warden.id`.
    - Shows an alert on success or failure.
    - Calls `onDelete` prop (if provided) and `onClose` prop on success.

## Props

- `warden` (Object): The warden/staff object containing details to be edited. Expected properties: `id`, `name`, `phone` (optional), `hostelIds` (optional Array), `joinDate` (optional).
- `staffType` (String, optional): Defaults to 'warden'. Determines API endpoints.
- `onClose` (Function): Callback function invoked to close the modal.
- `onSave` (Function, optional): Callback function invoked after a successful update API call.
- `onDelete` (Function, optional): Callback function invoked after a successful delete API call.

## State Management

- `formData` (Object): `{ phone: String, hostelIds: Array<String>, joinDate: String }`

## Key Components Rendered

- [`Modal`](../../common/Modal.md)

## API Usage

- `adminApi.updateWarden(wardenId, payload)` or `adminApi.updateAssociateWarden(wardenId, payload)`: Called on form submission.
- `adminApi.deleteWarden(wardenId)` or `adminApi.deleteAssociateWarden(wardenId)`: Called on confirmed deletion.

## Context Usage

- `useAdmin`: Accesses `hostelList` from the `AdminProvider` context.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaTrash`, `FaSave`, `FaBuilding`, `FaPhone`, `FaCalendarAlt`
- `../../../services/apiService`: `adminApi`
- `../../../contexts/AdminProvider`: `useAdmin`
- `../../common/Modal`
