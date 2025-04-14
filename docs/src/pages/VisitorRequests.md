# Visitor Requests Page (`/src/pages/VisitorRequests.jsx`)

This page serves as the interface for managing visitor accommodation requests.

## Route

Likely corresponds to routes like `/visitor-requests`, `/student/visitor-requests`, or `/warden/visitor-requests`.

## Purpose and Functionality

1.  **Display Requests:** Fetches and displays a summary list of visitor requests using the [`VisitorRequestTable`](../components/visitor/requests/VisitorRequestTable.md).
2.  **Data Fetching:**
    - Fetches visitor request summaries using `visitorApi.getVisitorRequestsSummary` for all relevant users.
    - For Students, it also fetches their saved visitor profiles using `visitorApi.getVisitorProfiles`.
    - Handles loading, error, and empty states during data fetching.
3.  **Filtering:**
    - Provides a toggleable filter section.
    - Allows filtering by request `status` (All, Pending, Approved, Rejected for Students; All, Approved for Wardens).
    - Allows filtering by room `allocation` status (All, Allocated, Unallocated) for Wardens/Associate Wardens.
4.  **Student Actions:**
    - **Add Visitor Profile:** Opens [`AddVisitorProfileModal`](../components/visitor/requests/AddVisitorProfileModal.md) to save visitor details for later use.
    - **Manage Visitor Profiles:** Opens [`ManageVisitorProfilesModal`](../components/visitor/requests/ManageVisitorProfilesModal.md) to view, edit, or delete saved profiles.
    - **New Request:** Opens [`AddVisitorRequestModal`](../components/visitor/requests/AddVisitorRequestModal.md) to create a new accommodation request, allowing selection from saved profiles or adding a new one via the Add Profile modal.
5.  **State Management:** Uses `useState` to manage loading state, errors, fetched requests and profiles, modal visibility (`showAddProfileModal`, `showAddRequestModal`, `showManageProfilesModal`, `showFilters`), and filter values (`statusFilter`, `allocationFilter`).
6.  **Access Control:** Uses `useAuth` to tailor the UI and available actions based on the user's role (Student vs. Warden/Associate Warden/Admin).

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: To get the current user's role and ID (`user._id` used when adding requests).

## Key Components Rendered

- [`VisitorRequestTable`](../components/visitor/requests/VisitorRequestTable.md)
- [`AddVisitorProfileModal`](../components/visitor/requests/AddVisitorProfileModal.md) (conditionally rendered, Student only)
- [`AddVisitorRequestModal`](../components/visitor/requests/AddVisitorRequestModal.md) (conditionally rendered, Student only)
- [`ManageVisitorProfilesModal`](../components/visitor/requests/ManageVisitorProfilesModal.md) (conditionally rendered, Student only)
- [`LoadingState`](../components/common/LoadingState.md)
- [`ErrorState`](../components/common/ErrorState.md)
- [`EmptyState`](../components/common/EmptyState.md)

## API Usage

- `visitorApi.getVisitorRequestsSummary()`
- `visitorApi.getVisitorProfiles()` (Student only)
- `visitorApi.addVisitorProfile(profileData)` (via Modal)
- `visitorApi.addVisitorRequest(requestData)` (via Modal)

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaUserFriends`, `FaPlus`, `FaFilter`, `FaUserEdit`
- `../contexts/AuthProvider`
- `../services/visitorApi`
- Multiple components from `/src/components/visitor/requests` and `/src/components/common`
