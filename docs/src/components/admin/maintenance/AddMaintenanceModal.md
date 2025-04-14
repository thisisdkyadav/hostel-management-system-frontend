# Add Maintenance Staff Modal Component (`/src/components/admin/maintenance/AddMaintenanceModal.jsx`)

This component renders a modal containing a form for administrators to add a new maintenance staff member to the system.

## Purpose and Functionality

1.  **Modal Display:** Uses the common [`Modal`](../../common/Modal.md) component. Visibility is controlled by the `show` prop.
2.  **Input Fields:** Provides fields for:
    - Staff Name
    - Email Address
    - Password (with a note about minimum length)
    - Specialty Category (dropdown populated from `MAINTENANCE_CATEGORIES`)
3.  **State Management:**
    - `formData`: Stores the current values of the input fields (`name`, `email`, `password`, `category`).
    - `loading`: Boolean state to indicate API submission progress.
    - `error`: Stores API error messages.
4.  **Input Handling:** `handleChange` updates the `formData` state.
5.  **Submission Handling:**
    - `handleSubmit` prevents default form submission.
    - Sets `loading` true, clears errors.
    - Calls `adminApi.addMaintenanceStaff(formData)` to create the new staff member account.
    - Shows an alert on success.
    - Resets the `formData` state to clear the form.
    - Calls `onSuccess` prop (if provided) and `onClose` prop.
    - Catches errors and sets the `error` state.
    - Resets `loading` in a `finally` block.
6.  **UI Feedback:** Displays API errors, disables the submit button, and shows a loading indicator during submission.

## Props

- `show` (Boolean): Controls whether the modal is displayed. If `false`, the component returns `null`.
- `onClose` (Function): Callback function invoked to close the modal (e.g., user clicks cancel or backdrop).
- `onSuccess` (Function, optional): Callback function invoked after a new staff member has been successfully added via the API. Likely used to refresh the staff list in the parent component.

## State Management

- `formData` (Object): `{ name: String, email: String, password: String, category: String }`
- `loading` (Boolean)
- `error` (String | null)

## Key Components Rendered

- [`Modal`](../../common/Modal.md)

## API Usage

- `adminApi.addMaintenanceStaff(formData)`: Called on form submission.

## Dependencies

- `react`: `useState`
- `react-icons/fi`: `FiUser`, `FiMail`, `FiLock`, `FiTool`
- `react-icons/fa`: `FaExclamationTriangle`
- `../../../services/apiService`: `adminApi`
- `../../common/Modal`

## Constants

- `MAINTENANCE_CATEGORIES` (Array): Defines the allowed categories for the dropdown.
