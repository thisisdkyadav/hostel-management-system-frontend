# Add Hostel Modal Component (`/src/components/admin/hostel/AddHostelModal.jsx`)

This component renders a modal containing a form used by administrators to add a new hostel to the system.

## Purpose and Functionality

1.  **Modal Display:** Wraps the form content within a common `Modal` component. Visibility is controlled by the `show` prop.
2.  **Basic Information Input:** Provides fields for the Hostel Name, Gender (Boys, Girls, Co-ed), and Hostel Type (Unit-based, Room-only).
3.  **Conditional Room Configuration:**
    - Based on the selected `Hostel Type`, it conditionally renders either:
      - [`UnitBasedForm`](../forms/UnitBasedForm.md): For defining floors, units per floor, rooms per unit, capacity, and exceptions.
      - [`RoomOnlyForm`](../forms/RoomOnlyForm.md): For defining floors, rooms per floor, capacity, and exceptions.
    - These sub-forms manage their specific configuration logic and update the main `formData` state (specifically the `units` and/or `rooms` arrays) via the `setFormData` prop.
4.  **State Management:** Uses `useState` to manage `formData`, which holds all hostel details including the structure defined by the sub-forms.
5.  **Submission Handling:**
    - On submit, prevents default form action.
    - Calls the `adminApi.addHostel` service with the complete `formData`.
    - Shows an alert on success or failure.
    - If successful:
      - Calls the `onAdd` prop function (likely to refresh the hostel list).
      - Calls the `onClose` prop function to close the modal.
      - Resets the form fields.
6.  **Form Reset:** A `resetForm` function clears the state back to default values.

## Props

- `show` (Boolean): Controls whether the modal is displayed. If `false`, the component returns `null`.
- `onClose` (Function): Callback function invoked when the modal should be closed (e.g., user clicks cancel, backdrop, or after successful submission).
- `onAdd` (Function): Callback function invoked after a new hostel has been successfully added via the API.

## State Management

- `formData` (Object): Holds the state of the entire form, including:
  - `name` (String): Hostel name.
  - `gender` (String): Selected gender ('Boys', 'Girls', 'Co-ed').
  - `type` (String): Selected hostel type ('unit-based', 'room-only').
  - `units` (Array, optional): Populated by `UnitBasedForm` if type is 'unit-based'.
  - `rooms` (Array, optional): Populated by `UnitBasedForm` or `RoomOnlyForm`.

## Key Components Rendered

- [`Modal`](../../common/Modal.md)
- [`UnitBasedForm`](../forms/UnitBasedForm.md) (conditionally)
- [`RoomOnlyForm`](../forms/RoomOnlyForm.md) (conditionally)

## API Usage

- `adminApi.addHostel(formData)`: Called on form submission to create the new hostel entry in the backend.

## Dependencies

- `react`: `useState`
- `../forms/UnitBasedForm`
- `../forms/RoomOnlyForm`
- `../../../services/apiService`: `adminApi`
- `../../common/Modal`
