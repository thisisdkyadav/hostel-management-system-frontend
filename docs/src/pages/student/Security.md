# Student Security Page (`/src/pages/student/Security.jsx`)

This page provides students with tools and information related to campus security access.

## Route

Likely corresponds to the `/student/security` route.

## Purpose and Functionality

1.  **QR Code Display:** Renders the [`QRCodeGenerator`](../../components/QRCodeGenerator.md) component, which displays a QR code likely used for identification and access at security points.
2.  **Access History:**
    - Fetches the student's access history (entry/exit logs) using `securityApi.getStudentEntries` when online.
    - Stores fetched history in `localStorage` (`SECURITY_CACHE_KEY`) with a timestamp.
    - If offline (`isOnline` from `useAuth` is false), attempts to load history from the cache.
    - If fetching fails while online, attempts to fall back to cached data.
    - Displays the access history using the [`AccessHistory`](../../components/AccessHistory.md) component, passing cached data if applicable.
3.  **Offline Notification:** Displays an [`OfflineBanner`](../../components/common/OfflineBanner.md) when showing cached access history data due to being offline.
4.  **Layout:** Arranges the QR code and access history components in a grid layout.

## Context Usage

- **`useAuth`** (from `../../contexts/AuthProvider`):
  - `isOnline`: Boolean indicating the network connection status, used for caching logic.

## Key Components Rendered

- [`QRCodeGenerator`](../../components/QRCodeGenerator.md)
- [`AccessHistory`](../../components/AccessHistory.md)
- [`OfflineBanner`](../../components/common/OfflineBanner.md) (conditionally rendered)

## API Usage

- `securityApi.getStudentEntries()`

## Dependencies

- `react`: `useState`, `useEffect`
- `../../contexts/AuthProvider`
- `../../services/apiService`: `securityApi`
- `../../components/QRCodeGenerator`
- `../../components/AccessHistory`
- `../../components/common/OfflineBanner`
