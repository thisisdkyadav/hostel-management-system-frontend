# Security Card Component (`/src/components/admin/security/SecurityCard.jsx`)

This component renders a card displaying summary information for a single security staff member.

## Purpose and Functionality

1.  **Data Display:**
    - Shows the security staff member's name (`security.name`).
    - Displays their email address (`security.email`).
    - Shows the name of the hostel they are assigned to (`security.hostelId`). Uses `useAdmin` hook to get `hostelList` and the `getHostelName` helper function to find the name based on the ID.
    - Displays the creation date (`security.createdAt`).
2.  **Assignment Status:**
    - Displays a status text ("Assigned" or "Unassigned") and a colored dot indicator based on whether `security.hostelId` exists (`getStatusColor` helper).
3.  **Edit Action:**
    - An "Edit" button triggers `setShowEditForm(true)`.
    - Conditionally renders the [`EditSecurityForm`](./EditSecurityForm.md) when `showEditForm` is true.
    - Passes the `security` object, `onUpdate`, `onDelete` props, and an `onClose` handler to the `EditSecurityForm`.

## Props

- `security` (Object): The security staff object to display. Expected properties: `id`, `name`, `email`, `hostelId` (String, ID of the assigned hostel), `createdAt` (optional).
- `onUpdate` (Function): Callback function passed down to `EditSecurityForm`. Invoked when the staff member is successfully updated.
- `onDelete` (Function): Callback function passed down to `EditSecurityForm`. Invoked when the staff member is successfully deleted.

## State Management

- `showEditForm` (Boolean): Controls the visibility of the `EditSecurityForm` modal.

## Context Usage

- `useAdmin`: Accesses `hostelList` from the `AdminProvider` context to look up hostel names.

## Key Components Rendered

- [`EditSecurityForm`](./EditSecurityForm.md) (conditionally)

## Dependencies

- `react`: `useState`
- `react-icons/fa`: `FaBuilding`, `FaEdit`, `FaEnvelope`, `FaShieldAlt`, `FaIdCard`, `FaCircle`
- `./EditSecurityForm`
- `../../../contexts/AdminProvider`: `useAdmin`
