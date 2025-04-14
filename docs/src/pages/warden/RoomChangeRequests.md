# Room Change Requests Page (`/src/pages/warden/RoomChangeRequests.jsx`)

This page allows Wardens and Associate Wardens to view and manage room change requests submitted by students for their assigned hostel.

## Route

Likely corresponds to routes like `/warden/room-requests` or `/associate-warden/room-requests`.

## Purpose and Functionality

1.  **Display Requests:** Fetches and displays room change requests using the [`RoomChangeRequestListView`](../../components/wardens/room/RoomChangeRequestListView.md) component, which supports both table and card view modes.
2.  **Data Fetching:**
    - Retrieves the Warden's `profile` (including `hostelId`) from the `useWarden` context.
    - Fetches paginated and filtered requests using `hostelApi.getRoomChangeRequests(hostelId, queryParams)`.
    - Uses `useEffect` with a debounce (`setTimeout`) to fetch data when filters or page change.
    - Manages loading state.
3.  **Filtering:**
    - Uses [`FilterTabs`](../../components/common/FilterTabs.md) to filter requests by status (All, Pending, Approved, Rejected - defined in `ROOM_CHANGE_FILTER_TABS`). Defaults to showing "Pending" requests.
    - Includes commented-out code for a [`SearchBar`](../../components/common/SearchBar.md) and a more detailed [`RoomChangeRequestFilterSection`](../../components/wardens/room/RoomChangeRequestFilterSection.md), suggesting these features might be planned or partially implemented.
    - Manages filter state (`status`, `searchTerm`) using `useState`.
4.  **Statistics:** Displays overall request statistics using [`RoomChangeRequestStats`](../../components/wardens/room/RoomChangeRequestStats.md).
5.  **View & Action on Request:**
    - Clicking a request (`handleRequestClick`) sets the `selectedRequest` state and opens the [`RoomChangeRequestDetailModal`](../../components/wardens/room/RoomChangeRequestDetailModal.md).
    - The modal likely allows the Warden to view details and approve/reject the request.
    - Successful updates within the modal (`handleRequestUpdate`) trigger a refetch of the request list.
6.  **Pagination:** Implements pagination using the [`Pagination`](../../components/common/Pagination.md) component.
7.  **State Management:** Uses `useState` to manage view mode, filter visibility, fetched requests, selected request, total items, loading state, modal visibility, current page, and filters.

## Context Usage

- **`useWarden`** (from `../../contexts/WardenProvider`):
  - `profile`: To get the `hostelId._id` for fetching requests relevant to the warden's assigned hostel.

## Key Components Rendered

- [`RoomChangeRequestStats`](../../components/wardens/room/RoomChangeRequestStats.md)
- [`FilterTabs`](../../components/common/FilterTabs.md)
- [`RoomChangeRequestListView`](../../components/wardens/room/RoomChangeRequestListView.md)
- [`Pagination`](../../components/common/Pagination.md) (conditionally rendered)
- [`NoResults`](../../components/common/NoResults.md) (conditionally rendered)
- [`RoomChangeRequestDetailModal`](../../components/wardens/room/RoomChangeRequestDetailModal.md) (conditionally rendered)
- _(Commented out: `SearchBar`, `RoomChangeRequestFilterSection`)_

## API Usage

- `hostelApi.getRoomChangeRequests(hostelId, queryParams)`

## Constants

- `ROOM_CHANGE_FILTER_TABS`: An array defining the labels and values for the status filter tabs.

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaExchangeAlt`, `FaBed`, `FaUserGraduate`
- `react-icons/md`: `MdFilterAlt`, `MdClearAll`
- `../../contexts/WardenProvider`
- `../../services/hostelApi`
- `../../constants/adminConstants` (Likely, although `ROOM_CHANGE_FILTER_TABS` is defined locally)
- Multiple components from `../../components/common` and `../../components/wardens/room`
