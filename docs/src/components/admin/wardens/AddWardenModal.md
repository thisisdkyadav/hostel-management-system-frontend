# Add Warden Modal Component (`/src/components/admin/wardens/AddWardenModal.jsx`)

This component renders a modal containing a form for administrators to add a new Warden or Associate Warden.

## Purpose and Functionality

1.  **Staff Type Handling:** Accepts a `staffType` prop ('warden' or other, defaulting to 'warden') to customize the modal title and determine which API endpoint to call for adding the staff member.
2.  **Modal Display:** Uses the common [`Modal`](../../common/Modal.md) component. Visibility is controlled by the `show` prop.
3.  **Input Fields:** Provides fields for:
    - Name
    - Email
    - Password
    - Phone (optional)
    - Join Date (optional)
4.  **State Management:**
    - `formData`: Stores the current values of the input fields (`name`, `email`, `password`, `phone`, `joinDate`).
5.  **Input Handling:** `handleChange` updates the `formData` state.
6.  **Submission Handling:**
    - `handleSubmit` prevents default form submission.
    - Calls the appropriate API endpoint based on `staffType` (`adminApi.addWarden` or `adminApi.addAssociateWarden`) with the `formData`.
    - Shows an alert on success or failure.
    - Calls the `onAdd` prop (if provided) on success.
    - Resets the `formData` state to clear the form on success.
    - Calls the `onClose` prop on success.

## Props

- `show` (Boolean): Controls whether the modal is displayed. If `false`, the component returns `null`.
- `staffType` (String, optional): Defaults to 'warden'. Determines the title and API endpoint used.
- `onClose` (Function): Callback function invoked to close the modal (e.g., user clicks cancel or after success).
- `onAdd` (Function): Callback function invoked after a new staff member has been successfully added via the API. Likely used to refresh the list in the parent component.

## State Management

- `formData` (Object): `{ name: String, email: String, password: String, phone: String, joinDate: String }`

## Key Components Rendered

- [`Modal`](../../common/Modal.md)

## API Usage

- `adminApi.addWarden(formData)` or `adminApi.addAssociateWarden(formData)`: Called on form submission based on `staffType`.

## Dependencies

- `react`: `useState`
- `react-icons/fi`: `FiUser`, `FiMail`, `FiPhone`, `FiLock`, `FiCalendar`
- `../../../services/apiService`: `adminApi`
- `../../common/Modal`
