# Update Password Page (`/src/pages/admin/UpdatePassword.jsx`)

This page provides an administrative interface to update the password for any user in the system.

## Route

Likely corresponds to the `/admin/update-password` route.

## Purpose and Functionality

1.  **Access Control:** Explicitly checks if the logged-in `user.role` is "Admin". If not, it renders an "Access Denied" message and prevents access to the main functionality.
2.  **Password Reset Form:** Renders the [`UpdatePasswordForm`](../../components/admin/password/UpdatePasswordForm.md) component, which likely contains fields for the target user's email and the new password.
3.  **Update Logic:**
    - The `handlePasswordUpdate` function is passed as the `onSubmit` prop to the form.
    - It first prompts the admin for confirmation using `window.confirm`.
    - If confirmed, it calls `adminApi.updateUserPassword` with the email and new password.
    - On success, it sets state to show the [`CommonSuccessModal`](../../components/common/CommonSuccessModal.md) with details about the updated user's email.
    - On failure, it displays an alert message.
4.  **Success Feedback:** Uses a generic success modal component to confirm the password update.

## Context Usage

- **`useAuth`** (from `../../contexts/AuthProvider`):
  - `user`: To check if the user has the "Admin" role for access control.

## Key Components Rendered

- [`UpdatePasswordForm`](../../components/admin/password/UpdatePasswordForm.md)
- [`CommonSuccessModal`](../../components/common/CommonSuccessModal.md) (conditionally rendered on success)
- Access Denied UI (conditionally rendered)

## API Usage

- `adminApi.updateUserPassword(email, newPassword)`

## Dependencies

- `react`: `useState`
- `react-icons/hi`: `HiKey`
- `../../contexts/AuthProvider`
- `../../services/apiService`: `adminApi`
- `../../components/admin/password/UpdatePasswordForm`
- `../../components/common/CommonSuccessModal`
