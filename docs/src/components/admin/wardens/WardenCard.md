# Warden Card Component (`/src/components/admin/wardens/WardenCard.jsx`)

This component renders a detailed card displaying information for a single Warden or Associate Warden.

## Purpose and Functionality

1.  **Staff Type Handling:** Accepts a `staffType` prop ('warden' or other, defaulting to 'warden') to adjust titles if needed (though not heavily used in the current display logic).
2.  **Data Display:**
    - Shows the staff member's name (`warden.name`).
    - Displays a profile image (`warden.profileImage`) or a placeholder icon.
    - Calculates and shows years of service based on `warden.joinDate` (`calculateServiceYears` helper).
    - Displays email (`warden.email`) and phone number (`warden.phone`) if available.
    - Lists the names of assigned hostels. Uses the `useAdmin` hook to get `hostelList` and the `getAssignedHostelNames` helper to map `warden.hostelIds` (which can be strings or objects with an `_id`) to hostel names.
    - Displays the full join date (`warden.joinDate`).
3.  **Assignment Status:**
    - Determines if the warden is assigned based on the presence and length of `warden.hostelIds`.
    - Displays a colored corner banner ("Assigned" or "Unassigned") using `getStatusColor` helper for styling.
4.  **Edit Action:**
    - An "Edit" icon button triggers `setShowEditForm(true)`.
    - Conditionally renders the [`EditWardenForm`](./EditWardenForm.md) when `showEditForm` is true.
    - Passes the `warden` object, `staffType`, `onUpdate` (via `handleSave`), `onDelete` (via `handleDelete`), and an `onClose` handler to the `EditWardenForm`.
    - **Note:** The `handleSave` and `handleDelete` functions in this component simply call the corresponding `onUpdate` and `onDelete` props passed _to_ the `WardenCard` and then close the modal. The actual API calls happen within `EditWardenForm`.

## Props

- `warden` (Object): The warden/staff object to display. Expected properties: `id`, `name`, `email`, `hostelIds` (Array of Strings or Objects with `_id`), `profileImage` (optional), `phone` (optional), `joinDate` (optional).
- `staffType` (String, optional): Defaults to 'warden'. Can be used to differentiate between wardens and associate wardens, although its current usage in the template is minimal.
- `onUpdate` (Function): Callback function invoked when the edit form is successfully saved (triggered by `handleSave`).
- `onDelete` (Function): Callback function invoked when the user confirms deletion in the edit form (triggered by `handleDelete`).

## State Management

- `showEditForm` (Boolean): Controls the visibility of the `EditWardenForm` modal.

## Context Usage

- `useAdmin`: Accesses `hostelList` from the `AdminProvider` context to look up assigned hostel names.

## Key Components Rendered

- [`EditWardenForm`](./EditWardenForm.md) (conditionally)

## Dependencies

- `react`: `useState`
- `react-icons/fa`: `FaBuilding`, `FaEdit`, `FaEnvelope`, `FaPhone`, `FaUserTie`
- `react-icons/bs`: `BsCalendarCheck`
- `./EditWardenForm`
- `../../../contexts/AdminProvider`: `useAdmin`
