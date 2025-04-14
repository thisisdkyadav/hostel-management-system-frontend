# Login With Google Component (`/src/components/LoginWithGoogle.jsx`)

This component renders the Google Sign-In button and handles the authentication flow using the `@react-oauth/google` library.

## Purpose and Functionality

1.  **Google OAuth Provider:** Wraps the Google login button with `<GoogleOAuthProvider>` to provide the necessary context, configured with the application's Google `clientId`.
2.  **Login Button:** Renders the `<GoogleLogin>` component from the library, which displays the standard Google Sign-In button.
3.  **Success Handling:**
    - The `onSuccess` prop of `<GoogleLogin>` is configured to receive the `tokenResponse` upon successful authentication.
    - It extracts the ID token (`tokenResponse.credential`).
    - It calls the `callback` function (passed via props) with the extracted token.
4.  **Error Handling:** Logs a simple message ("Login Failed") to the console if the Google login process encounters an error.

## Props

- `callback` (Function): An async function provided by the parent component (e.g., `LoginPage`) that will be called with the Google ID token (`credential`) upon successful login. This function is expected to handle the backend verification and user session creation.

## Dependencies

- `@react-oauth/google`: `GoogleOAuthProvider`, `GoogleLogin`

## Configuration

- Requires a Google Cloud Platform project with OAuth 2.0 configured and the Client ID stored in the `clientId` constant within the file.
