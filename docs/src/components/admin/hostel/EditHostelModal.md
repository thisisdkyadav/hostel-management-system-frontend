# Edit Hostel Modal Component (`/src/components/admin/hostel/EditHostelModal.jsx`)

This component renders a modal form for editing the basic details (name and gender) of an existing hostel. It also provides a button to open a separate modal for managing the hostel's rooms.

## Purpose and Functionality

1.  **Modal Display:** Uses the common `Modal` component to display the form.
2.  **Form Initialization:** Uses `useEffect` to populate the form fields (`name`, `gender`) with the data from the `hostel` prop when the modal is opened or the `hostel` prop changes.
3.  **Input Fields:** Provides controlled input fields for Hostel Name and a dropdown for Gender.
4.  **State Management:**
    - `formData`: Stores the current values of the `name` and `gender` fields.
    - `errors`: Stores validation error messages for each field and a general form error.
    - `isSubmitting`: Tracks the API submission state to disable the save button and show a loading indicator.
    - `showRoomManagementModal`: Controls the visibility of the `RoomManagementModal`.
5.  **Input Handling:** `handleChange` updates `formData` and clears the specific field's error.
6.  **Client-Side Validation:**
    - `validateForm` checks if the name is non-empty (after trimming) and if a gender is selected.
    - Sets the `errors` state and returns `true` if valid, `false` otherwise.
7.  **Submission Handling:**
    - `handleSubmit` prevents default submission and runs validation.
    - If valid, sets `isSubmitting` to true.
    - Calls the `onSave` prop function (provided by the parent), passing an updated hostel object with the new `name` and `gender`.
    - Calls `onClose` upon successful save.
    - Catches potential errors during the `onSave` call (e.g., API failure) and displays them in `errors.form`.
    - Sets `isSubmitting` back to false in a `finally` block.
8.  **Room Management:**
    - Includes a button ("Manage Hostel Rooms") that sets `showRoomManagementModal` to `true`.
    - Conditionally renders the [`RoomManagementModal`](./RoomManagementModal.md), passing the `hostel` object and callbacks (`onClose`, `onRoomsUpdated`).
    - `handleRoomsUpdated`: This function is passed to `RoomManagementModal` and is called when rooms are updated within that modal. It currently triggers the `onSave` prop, likely to signal to the parent component that data related to the hostel (even if just rooms) has changed, prompting a potential refresh or state update in the parent.
9.  **Error Display:** Shows general form errors (`errors.form`) at the top and field-specific errors below each input.
10. **UI Feedback:** Uses icons within inputs, highlights fields with errors, disables the submit button during submission, and shows a loading spinner.

## Props

- `hostel` (Object): The hostel object containing the details to be edited.
- `onClose` (Function): Callback function invoked to close the edit modal.
- `onSave` (Function): An async function provided by the parent component. It's called with the updated hostel object when the user saves changes. It should handle the API call to update the hostel details.

## State Management

- `formData` (Object): `{ name: String, gender: String }`
- `errors` (Object): `{ name?: String, gender?: String, form?: String }`
- `isSubmitting` (Boolean)
- `showRoomManagementModal` (Boolean)

## Key Components Rendered

- [`Modal`](../../common/Modal.md)
- [`Button`](../../common/Button.md)
- [`RoomManagementModal`](./RoomManagementModal.md) (conditionally)

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaBuilding`, `FaUser`, `FaDoorOpen`
- `../../common/Modal`
- `../../common/Button`
- `./RoomManagementModal`
