# Student Dashboard Page (`/src/pages/student/Dashboard.jsx`)

This page serves as the personalized dashboard for logged-in students, providing an overview of their relevant information and activities.

## Route

Likely corresponds to the `/student` or `/student/dashboard` route.

## Purpose and Functionality

1.  **Data Fetching & Caching:**
    - Fetches comprehensive dashboard data for the student using `studentApi.getStudentDashboard` when online.
    - Stores fetched data in `localStorage` (`DASHBOARD_CACHE_KEY`) with a timestamp.
    - If offline (`isOnline` from `useAuth` is false), attempts to load data from the cache.
    - If fetching fails while online, attempts to fall back to cached data.
    - Manages loading, error, and offline states.
2.  **Information Display:** Renders various summary components using the fetched `dashboardData`:
    - [`StudentProfile`](../../components/student/StudentProfile.md): Displays basic student profile information.
    - [`DashboardStats`](../../components/student/DashboardStats.md): Shows key statistics (e.g., pending requests, active complaints).
    - [`RoomInfoCard`](../../components/student/RoomInfoCard.md): Displays details about the student's allocated room.
    - [`LostFoundSummary`](../../components/student/LostFoundSummary.md): Summarizes lost and found item statistics.
    - [`ComplaintsSummary`](../../components/student/ComplaintsSummary.md): Lists the student's active complaints.
    - [`EventsCalendar`](../../components/student/EventsCalendar.md): Shows upcoming events.
3.  **Layout:** Arranges the summary components in a multi-column grid layout.
4.  **Offline Notification:** Displays an [`OfflineBanner`](../../components/common/OfflineBanner.md) when showing cached data due to being offline.
5.  **QR Code Access:**
    - Includes a button (visible on mobile) to open a [`Modal`](../../components/common/Modal.md).
    - The modal displays a [`QRCodeGenerator`](../../components/QRCodeGenerator.md) component, likely for campus access or identification.

## Context Usage

- **`useAuth`** (from `../../contexts/AuthProvider`):
  - `user`: The logged-in student user object.
  - `isOnline`: Boolean indicating the network connection status, used for caching logic.

## Key Components Rendered

- [`OfflineBanner`](../../components/common/OfflineBanner.md) (conditionally rendered)
- [`StudentProfile`](../../components/student/StudentProfile.md)
- [`DashboardStats`](../../components/student/DashboardStats.md)
- [`RoomInfoCard`](../../components/student/RoomInfoCard.md)
- [`LostFoundSummary`](../../components/student/LostFoundSummary.md)
- [`ComplaintsSummary`](../../components/student/ComplaintsSummary.md)
- [`EventsCalendar`](../../components/student/EventsCalendar.md)
- [`QRCodeGenerator`](../../components/QRCodeGenerator.md) (within a Modal)
- [`Modal`](../../components/common/Modal.md) (for QR Code)

## API Usage

- `studentApi.getStudentDashboard()`

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons`: `AiOutlineLoading3Quarters`, `BiError`, `FaQrcode`
- `../../contexts/AuthProvider`
- `../../services/apiService`: `studentApi`
- Multiple components from `../../components/common` and `../../components/student`
- `../../components/QRCodeGenerator`
