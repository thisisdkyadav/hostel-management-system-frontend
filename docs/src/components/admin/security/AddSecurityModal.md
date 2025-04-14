# Add Security Modal Component (`/src/components/admin/security/AddSecurityModal.jsx`)

This component renders a modal containing a form for administrators to add new security personnel to the system and assign them to a hostel.

## Purpose and Functionality

1.  **Modal Display:** Uses the common [`Modal`](../../common/Modal.md) component. Visibility is controlled by the `show` prop.
2.  **Hostel Data:** Uses the `useAdmin` hook to get the `hostelList` for populating the assignment dropdown.
3.  **Input Fields:** Provides fields for:
    - Security Name
    - Email Address
    - Password (with a note about minimum length)
    - Assign Hostel (dropdown populated with `hostelList`)
4.  **State Management:**
    - `formData`: Stores the current values of the input fields (`name`, `email`, `password`, `hostelId`).
    - `loading`: Boolean state to indicate API submission progress.
    - `error`: Stores API error messages.
5.  **Input Handling:** `handleChange` updates the `formData` state.
6.  **Submission Handling:**
    - `handleSubmit` prevents default form submission.
    - Sets `loading` true, clears errors.
    - Calls `adminApi.addSecurity(formData)` to create the new security account.
    - Shows an alert on success.
    - Resets the `formData` state to clear the form.
    - Calls `onSuccess` prop (if provided) and `onClose` prop.
    - Catches errors and sets the `error` state.
    - Resets `loading` in a `finally` block.
7.  **UI Feedback:** Displays API errors, disables the submit button, and shows a loading indicator during submission.

## Props

- `show` (Boolean): Controls whether the modal is displayed. If `false`, the component returns `null`.
- `onClose` (Function): Callback function invoked to close the modal (e.g., user clicks cancel or backdrop).
- `onSuccess` (Function, optional): Callback function invoked after new security personnel have been successfully added via the API. Likely used to refresh the list in the parent component.

## State Management

- `formData` (Object): `{ name: String, email: String, password: String, hostelId: String }`
- `loading` (Boolean)
- `error` (String | null)

## Key Components Rendered

- [`Modal`](../../common/Modal.md)

## API Usage

- `adminApi.addSecurity(formData)`: Called on form submission.

## Context Usage

- `useAdmin`: Accesses `hostelList` from the `AdminProvider` context.

## Dependencies

- `react`: `useState`
- `react-icons/fi`: `FiUser`, `FiMail`, `FiLock`, `FiHome`
- `react-icons/fa`: `FaExclamationTriangle`
- `../../../services/apiService`: `adminApi`
- `../../../contexts/AdminProvider`: `useAdmin`
- `../../common/Modal`
