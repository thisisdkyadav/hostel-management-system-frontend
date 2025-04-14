# Complaints Page (`/src/pages/Complaints.jsx`)

This page serves as the central hub for viewing and managing maintenance complaints within the hostel system.

## Route

Likely corresponds to a route like `/complaints` or `/student/complaints` or `/admin/complaints`, depending on the routing setup and user role.

## Purpose and Functionality

1.  **Display Complaints:** Fetches and displays a list of complaints using the [`ComplaintsContent`](../components/complaints/ComplaintsContent.md) component, which likely handles different view modes (e.g., list, card) and status tabs.
2.  **Data Fetching:**
    - Uses `adminApi.getAllComplaints` to fetch a paginated and filtered list of complaints.
    - Fetches data based on the `filters` state (status, priority, category, hostel, search term, page, limit).
    - Includes a debounce mechanism (`setTimeout`) in `useEffect` to avoid excessive API calls while typing in filters.
3.  **Filtering:**
    - Provides a toggleable filter panel ([`ComplaintsFilterPanel`](../components/complaints/ComplaintsFilterPanel.md)) with options for status, priority, category, hostel (for Admins), and search term.
    - Manages filter state using `useState`.
4.  **Statistics:** Displays overall complaint statistics using [`ComplaintStats`](../components/complaints/ComplaintStats.md).
5.  **View Details:** Clicking on a complaint triggers `viewComplaintDetails`, which sets the `selectedComplaint` state and shows the [`ComplaintDetailModal`](../components/complaints/ComplaintDetailModal.md).
6.  **Create Complaint (Student):**
    - A button (likely within [`ComplaintsHeader`](../components/complaints/ComplaintsHeader.md)) toggles the visibility of the [`ComplaintForm`](../components/students/ComplaintForm.md) modal for users with the 'Student' role.
    - Successful submission triggers a refetch of the complaints list.
7.  **Pagination:** Implements pagination via the `paginate` function, which updates the `page` filter and is likely passed to the [`Pagination`](../components/common/Pagination.md) component within `ComplaintsContent`.
8.  **State Management:** Uses `useState` to manage filters, fetched complaints, loading state, pagination info (total items, total pages), selected complaint, modal visibility, and view mode.
9.  **UI Structure:** Uses dedicated components for the header ([`ComplaintsHeader`](../components/complaints/ComplaintsHeader.md)), stats, filter panel, and main content area.

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: To determine the user's role for conditional rendering (e.g., hostel filter, create complaint form).
- **`useGlobal`** (from [`/src/contexts/GlobalProvider.jsx`](../contexts/GlobalProvider.md)):
  - `hostelList`: To populate the hostel filter dropdown (for Admins).

## Key Components Rendered

- [`ComplaintsHeader`](../components/complaints/ComplaintsHeader.md)
- [`ComplaintStats`](../components/complaints/ComplaintStats.md)
- [`ComplaintsFilterPanel`](../components/complaints/ComplaintsFilterPanel.md) (conditionally rendered)
- [`ComplaintsContent`](../components/complaints/ComplaintsContent.md)
- [`ComplaintDetailModal`](../components/complaints/ComplaintDetailModal.md) (conditionally rendered)
- [`ComplaintForm`](../components/students/ComplaintForm.md) (conditionally rendered, Student only)

## API Usage

- `adminApi.getAllComplaints(queryParams)`

## Constants

- `COMPLAINT_FILTER_TABS` (from `../constants/adminConstants`): Likely used within `ComplaintsContent` for status tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `../contexts/AuthProvider`, `../contexts/GlobalProvider`
- `../services/apiService`: `adminApi`
- `../constants/adminConstants`
- Multiple components from `/src/components/complaints`, `/src/components/students`, `/src/components/common`
