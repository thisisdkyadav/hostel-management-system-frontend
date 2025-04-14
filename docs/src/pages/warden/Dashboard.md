# Warden Dashboard Page (`/src/pages/warden/Dashboard.jsx`)

This page serves as the main dashboard for Warden and Associate Warden users, providing statistics relevant to their assigned hostel(s).

## Route

Likely corresponds to the `/warden` or `/associate-warden` route, possibly also `/warden/dashboard`.

## Purpose and Functionality

1.  **Data Fetching:**
    - Retrieves the Warden's `profile` (including `hostelId`) from the `useWarden` context.
    - On component mount and when the profile is available, fetches various statistics concurrently using `Promise.all` from the `statsApi` service, passing the `hostelId` where needed:
      - `statsApi.getLostAndFoundStats()`
      - `statsApi.getEventStats(hostelId)`
      - `statsApi.getVisitorStats(hostelId)`
    - Manages loading states (for profile and stats) and error states.
2.  **Statistics Display:**
    - Displays key summary metrics (Total Visitors, Lost & Found Items, Events) using the [`StatCards`](../../components/common/StatCards.md) component.
    - Presents detailed breakdowns using various chart components:
      - [`LostFoundChart`](../../components/charts/LostFoundChart.md): Shows lost & found item status.
      - [`VisitorStatsChart`](../../components/charts/VisitorStatsChart.md): Shows visitor check-in/check-out stats.
      - [`EventsChart`](../../components/charts/EventsChart.md): Shows upcoming vs. past event counts.
    - Includes a local helper component `StatInfo` to display individual stats below charts.
3.  **Layout:** Arranges the stat cards and charts in a grid layout.
4.  **Role Display:** Displays the title as "Warden Dashboard" or "Associate Warden Dashboard" based on the `isAssociateWarden` flag from the `useWarden` context.

## Context Usage

- **`useWarden`** (from `../../contexts/WardenProvider`):
  - `profile`: To get the Warden's name and assigned `hostelId._id` for fetching relevant stats.
  - `isAssociateWarden`: To display the correct dashboard title.

## Key Components Rendered

- [`StatCards`](../../components/common/StatCards.md)
- [`LostFoundChart`](../../components/charts/LostFoundChart.md)
- [`VisitorStatsChart`](../../components/charts/VisitorStatsChart.md)
- [`EventsChart`](../../components/charts/EventsChart.md)
- `StatInfo` (local helper component)

## API Usage

- `statsApi.getLostAndFoundStats()`
- `statsApi.getEventStats(hostelId)`
- `statsApi.getVisitorStats(hostelId)`

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons`: `BiError`, `BiCalendarEvent`, `FaUser`, `FaUsers`, `MdChangeCircle`, `MdDashboard`, `FiSearch`, `AiOutlineLoading3Quarters`
- `../../contexts/WardenProvider`
- `../../services/apiService`: `statsApi`
- Multiple components from `../../components/common` and `../../components/charts`
