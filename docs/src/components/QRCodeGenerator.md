# QR Code Generator Component (`/src/components/QRCodeGenerator.jsx`)

This component generates a time-sensitive QR code intended for campus security access verification.

## Purpose and Functionality

1.  **Key Retrieval:** Retrieves a pre-shared public key (`publicKey`) from `localStorage` on component mount.
    _(Security Note: Storing cryptographic keys in localStorage is generally insecure and vulnerable to XSS attacks. Consider alternative methods like fetching short-lived tokens from the backend.)_
2.  **QR Code Generation (`generateQR`):**
    - Triggered by a button click.
    - Checks if the `publicKey` exists.
    - Sets an expiry time (currently hardcoded to 5 minutes from generation).
    - Encrypts the expiry timestamp (`expiryMs`) using AES-CBC with the retrieved `publicKey` (treated as an AES key) and a randomly generated IV. Encryption uses the `node-forge` library.
    - Constructs a JSON object containing the user's email (`user.email` from `useAuth`) and the base64-encoded encrypted data (`iv:encrypted_timestamp`).
    - Sets the JSON string as the `qrData` state.
    - Sets the `expiryTime` state to manage the countdown.
    - Sets `showQR` to true to display the generated code.
3.  **QR Code Display:**
    - Uses the `QRCodeSVG` component from the `qrcode.react` library to render the `qrData` string as an SVG QR code.
    - Displays a countdown timer showing the time remaining until the QR code expires.
    - The timer color changes from green to red (and pulses) when less than 60 seconds remain.
    - Provides a "Refresh" button to generate a new QR code.
4.  **Expiration Handling:**
    - Uses `useEffect` and `setInterval` to update the countdown timer every second.
    - When the countdown reaches zero, it clears the interval, hides the QR code (`setShowQR(false)`), and resets the expiry time.

## Props

- None explicitly defined in the component signature, but it might receive props if used within other parent components (e.g., `isOfflineMode` seems used in `src/pages/student/Security.jsx` but not declared here).

## Context Usage

- **`useAuth`** (from `../contexts/AuthProvider`):
  - `user`: To get the user's email (`user.email`) for embedding in the QR code data.

## Key Components Rendered

- `QRCodeSVG` (from `qrcode.react`)
- [`Button`](./common/Button.md)

## Dependencies

- `react`: `useState`, `useEffect`
- `qrcode.react`: `QRCodeSVG`
- `node-forge`: For AES encryption and utility functions (`forge.util`, `forge.random`, `forge.cipher`).
- `react-icons/fa`: `FaQrcode`, `FaSyncAlt`, `FaDownload`, `FaInfoCircle` (Note: `FaDownload` seems imported but not used).
- `../contexts/AuthProvider`
- `./common/Button`
