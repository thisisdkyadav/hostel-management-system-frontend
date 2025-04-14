# Edit Security Form Component (`/src/components/admin/security/EditSecurityForm.jsx`)

This component renders a modal containing a form to edit the details (name and hostel assignment) of an existing security staff member.

## Purpose and Functionality

1.  **Modal Display:** Wraps the form content within a common [`Modal`](../../common/Modal.md) component.
2.  **Hostel Data:** Uses the `useAdmin` hook to get the `hostelList` for populating the assignment dropdown.
3.  **Form Initialization:** Initializes the `formData` state with the `name` and `hostelId` from the `security` prop.
4.  **Input Fields:**
    - **Security Name:** Text input for the staff member's name.
    - **Hostel Assignment:** Dropdown select populated with `hostelList`. Allows changing or unassigning the hostel.
5.  **State Management:**
    - `formData`: Stores the current values of the `name` and `hostelId` fields.
    - `loading`: Boolean state to indicate API call progress.
    - `error`: Stores API error messages.
6.  **Input Handling:** `handleChange` updates the `formData` state.
7.  **Update Handling:**
    - `handleSubmit` prevents default form submission.
    - Sets `loading` true, clears errors.
    - Calls `adminApi.updateSecurity(security.id, formData)` to update the staff details.
    - Shows an alert on success.
    - Calls `onUpdate` prop (if provided) and `onClose` prop.
    - Catches errors, sets the `error` state.
    - Resets `loading` in a `finally` block.
8.  **Delete Handling:**
    - `handleDelete` is triggered by the "Delete Account" button.
    - Uses `window.confirm` for confirmation.
    - If confirmed, sets `loading` true, clears errors.
    - Calls `adminApi.deleteSecurity(security.id)`.
    - Shows an alert on success.
    - Calls `onDelete` prop (if provided) and `onClose` prop.
    - Catches errors, sets the `error` state.
    - Resets `loading` in a `finally` block.
9.  **UI Feedback:** Displays API errors, disables buttons, and shows loading spinners during API calls.

## Props

- `security` (Object): The security staff object containing details to be edited. Expected properties: `id`, `name`, `hostelId`.
- `onClose` (Function): Callback function invoked to close the modal.
- `onUpdate` (Function, optional): Callback function invoked after a successful update. Likely refreshes the parent list.
- `onDelete` (Function, optional): Callback function invoked after a successful deletion. Likely refreshes the parent list.

## State Management

- `formData` (Object): `{ name: String, hostelId: String }`
- `loading` (Boolean)
- `error` (String | null)

## Key Components Rendered

- [`Modal`](../../common/Modal.md)

## API Usage

- `adminApi.updateSecurity(securityId, formData)`: Called on form submission.
- `adminApi.deleteSecurity(securityId)`: Called on confirmed deletion.

## Context Usage

- `useAdmin`: Accesses `hostelList` from the `AdminProvider` context.

## Dependencies

- `react`: `useState`
- `react-icons/fa`: `FaTrash`, `FaSave`, `FaBuilding`, `FaUser`, `FaExclamationTriangle`
- `../../../services/apiService`: `adminApi`
- `../../../contexts/AdminProvider`: `useAdmin`
- `../../common/Modal`
