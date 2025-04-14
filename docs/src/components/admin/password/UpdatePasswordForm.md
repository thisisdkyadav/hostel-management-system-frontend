# Update Password Form Component (`/src/components/admin/password/UpdatePasswordForm.jsx`)

This component provides the form interface used by administrators to update a user's password.

## Purpose and Functionality

1.  **Input Fields:** Renders controlled input fields for:
    - User's Email Address (`email`)
    - New Password (`newPassword`)
    - Confirm New Password (`confirmPassword`)
2.  **State Management:** Uses `useState` to manage:
    - `formData`: Stores the current values of the input fields.
    - `errors`: Stores validation error messages for each field.
    - `isSubmitting`: Tracks the submission state to disable the button and show a loading indicator.
3.  **Input Handling:** The `handleChange` function updates the `formData` state as the user types and clears any existing validation error for the changed field.
4.  **Client-Side Validation:**
    - The `validate` function checks:
      - If email is present and has a valid format.
      - If the new password is present and meets the minimum length requirement (currently 6 characters).
      - If the new password and confirmation password match.
    - Returns an object containing any validation errors.
5.  **Submission Handling:**
    - The `handleSubmit` function:
      - Prevents default form submission.
      - Calls `validate` to check for errors. If errors exist, updates the `errors` state and stops.
      - Sets `isSubmitting` to true.
      - Calls the `onSubmit` prop function (passed from the parent page, e.g., `UpdatePassword.jsx`), passing the validated `email` and `newPassword`.
      - Resets the form fields upon successful submission (assuming `onSubmit` resolves).
      - Sets `isSubmitting` back to false.
6.  **Error Display:** Displays validation errors below the corresponding input fields if the `errors` state contains messages for them.
7.  **UI Feedback:**
    - Highlights input fields with errors using red borders/background.
    - Disables the submit button and shows a loading indicator while `isSubmitting` is true.
    - Includes a warning message about the action's effect.

## Props

- `onSubmit` (Function): An async function provided by the parent component. It is called with `(email, newPassword)` when the form is submitted successfully after passing validation. It should handle the API call to update the password.

## Dependencies

- `react`: `useState`
- `react-icons/hi`: `HiMail`, `HiLockClosed`, `HiExclamationCircle`
