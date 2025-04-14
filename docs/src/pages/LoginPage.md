# Login Page (`/src/pages/LoginPage.jsx`)

This page provides the user interface for authentication, allowing users to log in using their email/password or via Google.

## Route

Corresponds to the `/login` path.

## Purpose and Functionality

1.  **Authentication Form:** Displays input fields for email and password.
2.  **Email/Password Login:**
    - Handles form submission (`handleSubmit`).
    - Calls the `login` function from `useAuth` context with email and password.
    - Displays loading state and error messages (`loading`, `error` from `useAuth`).
3.  **Google Login:**
    - Renders the [`LoginWithGoogle`](../components/LoginWithGoogle.md) component.
    - Provides a callback function (`handleGoogleCallback`) to the Google login component.
    - Upon receiving a token from Google login, calls `loginWithGoogle` from `useAuth` context.
4.  **Redirection:**
    - Uses `useEffect` to check if a user is already authenticated (`user` from `useAuth`). If so, immediately redirects them to their appropriate home route using `calculateHomeRoute`.
    - Upon successful login (either email/password or Google), it calculates the user-specific home route using `calculateHomeRoute` and navigates the user there using `useNavigate` with `{ replace: true }`.
5.  **Forgot Password:**
    - Includes a "Forgot your password?" link.
    - Clicking this link (`handleForgotPassword`) shows a simple modal informing the user to contact the administrator.
6.  **Home Route Calculation:** The `calculateHomeRoute` internal function determines the correct dashboard path (e.g., `/student`, `/warden`, `/admin`) based on the `user.role`.

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: The currently authenticated user object (or null).
  - `login`: Function to perform email/password login.
  - `loginWithGoogle`: Function to perform Google login using a token.
  - `loading`: Boolean indicating if an authentication process is in progress.
  - `error`: Stores any error message from the authentication process.

## Key Components Rendered

- [`LoginWithGoogle`](../components/LoginWithGoogle.md): Component handling the Google Sign-In button and logic.
- A simple modal for the "Forgot Password" message.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-router-dom`: `useNavigate`, `useLocation` (Note: `useLocation` seems imported but not used directly in the provided snippet)
- `../contexts/AuthProvider`: `useAuth`
- `../components/LoginWithGoogle`
