# Edit Maintenance Staff Form Component (`/src/components/admin/maintenance/EditMaintenanceForm.jsx`)

This component renders a modal containing a form to edit the details of an existing maintenance staff member.

## Purpose and Functionality

1.  **Modal Display:** Wraps the form content within a common [`Modal`](../../common/Modal.md) component.
2.  **Form Initialization:** Initializes the `formData` state with the `name` and `category` from the `staff` prop.
3.  **Input Fields:**
    - **Staff Name:** Text input for the staff member's name.
    - **Specialty Category:** Dropdown select populated with predefined `MAINTENANCE_CATEGORIES`. Allows changing the staff member's specialty.
4.  **State Management:**
    - `formData`: Stores the current values of the `name` and `category` fields.
    - `loading`: Boolean state to indicate when an API call (update or delete) is in progress, used to disable buttons and show spinners.
    - `error`: Stores error messages from API calls.
5.  **Input Handling:** `handleChange` updates the `formData` based on input changes.
6.  **Update Handling:**
    - `handleSubmit` prevents default form submission.
    - Sets `loading` to true, clears previous errors.
    - Calls `adminApi.updateMaintenanceStaff(staff.id, formData)` to update the staff details.
    - Shows an alert on success.
    - Calls `onUpdate` prop (if provided) and `onClose` prop.
    - Catches errors, sets the `error` state.
    - Resets `loading` in a `finally` block.
7.  **Delete Handling:**
    - `handleDelete` is triggered by the "Delete Account" button.
    - Uses `window.confirm` to ask the user for confirmation.
    - If confirmed, sets `loading` to true, clears errors.
    - Calls `adminApi.deleteMaintenanceStaff(staff.id)`.
    - Shows an alert on success.
    - Calls `onDelete` prop (if provided) and `onClose` prop.
    - Catches errors, sets the `error` state.
    - Resets `loading` in a `finally` block.
8.  **UI Feedback:** Displays API errors, disables buttons, and shows loading spinners during API calls.

## Props

- `staff` (Object): The maintenance staff object containing the details to be edited. Expected properties: `id`, `name`, `category`.
- `onClose` (Function): Callback function invoked to close the modal.
- `onUpdate` (Function, optional): Callback function invoked after a successful update API call. Likely used to refresh the staff list in the parent component.
- `onDelete` (Function, optional): Callback function invoked after a successful delete API call. Likely used to refresh the staff list in the parent component.

## State Management

- `formData` (Object): `{ name: String, category: String }`
- `loading` (Boolean)
- `error` (String | null)

## Key Components Rendered

- [`Modal`](../../common/Modal.md)

## API Usage

- `adminApi.updateMaintenanceStaff(staffId, formData)`: Called on form submission.
- `adminApi.deleteMaintenanceStaff(staffId)`: Called on confirmed deletion.

## Dependencies

- `react`: `useState`
- `react-icons/fa`: `FaTrash`, `FaSave`, `FaTools`, `FaExclamationTriangle`
- `../../../services/apiService`: `adminApi`
- `../../common/Modal`

## Constants

- `MAINTENANCE_CATEGORIES` (Array): Defines the allowed categories for the dropdown.
