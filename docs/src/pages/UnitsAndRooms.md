# Units and Rooms Page (`/src/pages/UnitsAndRooms.jsx`)

This page component is responsible for displaying and managing the units and/or rooms within a specific hostel. It adapts dynamically based on the hostel's type (`unit-based` or `room-only`) and the URL parameters.

## Routes

This page handles routes like:

- `/hostels/:hostelName`: Displays units (for `unit-based` hostels) or rooms (for `room-only` hostels).
- `/hostels/:hostelName/units/:unitNumber`: Displays rooms within a specific unit (for `unit-based` hostels).

`:hostelName` is expected to be URL-encoded.

## Purpose and Functionality

1.  **Hostel Identification:** Retrieves the hostel name and optional unit number from URL parameters using `useParams` and identifies the corresponding hostel object from the global `hostelList`.
2.  **View Determination:** Determines the current view (`units` or `rooms`) based on whether a `unitNumber` is present in the URL and the `hostelType` (`unit-based` or `room-only`).
3.  **Data Fetching:** Fetches relevant data using the `hostelApi` service:
    - Fetches all units for the current hostel (`hostelApi.getUnits`) if it's `unit-based`.
    - Fetches rooms based on context:
      - Paginated and filtered list of all rooms for the hostel (`hostelApi.getRooms`) if it's `room-only` or if filtering rooms directly.
      - List of rooms belonging to a specific unit (`hostelApi.getRoomsByUnit`) when viewing a specific unit.
4.  **Filtering:** Provides advanced filtering capabilities:
    - **Units (Unit-Based View):** Filter by min/max capacity, min/max occupancy, and whether to show only empty units.
    - **Rooms (Room View):** Filter by search term (room number), floor number, room type, and occupancy status (implementation details for some room filters might be pending based on the code comments).
    - Includes a [`SearchBar`](../components/common/SearchBar.md) and a filter reset option.
5.  **Display:** Renders units or rooms using different view components:
    - [`UnitListView`](../components/wardens/UnitListView.md): Displays units.
    - [`RoomListView`](../components/wardens/RoomListView.md): Displays rooms.
    - Supports switching between `table` and `card` display modes.
    - Displays statistics using [`UnitStats`](../components/wardens/UnitStats.md) or [`RoomStats`](../components/wardens/RoomStats.md).
    - Shows a [`NoResults`](../components/common/NoResults.md) component when data is empty.
6.  **Pagination:** Implements pagination using the [`Pagination`](../components/common/Pagination.md) component for room lists when applicable.
7.  **Modals & Actions:**
    - **Room Details:** Clicking a room opens [`RoomDetailModal`](../components/wardens/RoomDetailModal.md) to view details and potentially update room information.
    - **Allocate Student:** Provides an option (likely within `RoomDetailModal` or `RoomListView`) to open [`AllocateStudentModal`](../components/wardens/AllocateStudentModal.md) to assign a student to a room.
    - **Bulk Update Allocations (Admin):** An admin-only button opens [`UpdateAllocationModal`](../components/common/students/UpdateAllocationModal.md) to upload and process bulk student allocations via `hostelApi.updateRoomAllocations`.
8.  **Navigation:**
    - Handles navigation between the unit list view and the room list view for a specific unit.
    - Provides back buttons to navigate to the main hostel list (for Admins) or back to the unit list.
    - Redirects Wardens/Associate Wardens if they try to access a hostel they are not assigned to (based on `useWarden` context).
9.  **State Management:** Uses `useState` heavily to manage loading status, fetched data (units, rooms), selected items (unit, room), filter values, pagination state, modal visibility, and view mode.
10. **Access Control:** Checks user role (`useAuth`) and Warden assignments (`useWarden`) to control access and display appropriate actions (e.g., bulk update button for Admin).

## Context Usage

- **`useAuth`** (from [`/src/contexts/AuthProvider.jsx`](../contexts/AuthProvider.md)):
  - `user`: To get the current user's role and information.
  - `getHomeRoute()`: To construct correct navigation paths.
- **`useGlobal`** (from [`/src/contexts/GlobalProvider.jsx`](../contexts/GlobalProvider.md)):
  - `hostelList`: To find the current hostel object based on the URL parameter.
  - `fetchHostelList()`: To fetch the list if it's not already available.
- **`useWarden`** (from [`/src/contexts/WardenProvider.jsx`](../contexts/WardenProvider.md)):
  - `profile`: To check the warden's assigned hostels (`activeHostelId`, `hostelIds`) for access control and redirection.

## Key Components Rendered

- [`SearchBar`](../components/common/SearchBar.md)
- [`Pagination`](../components/common/Pagination.md)
- [`NoResults`](../components/common/NoResults.md)
- [`AccessDenied`](../components/common/AccessDenied.md)
- [`UnitStats`](../components/wardens/UnitStats.md)
- [`RoomStats`](../components/wardens/RoomStats.md)
- [`UnitListView`](../components/wardens/UnitListView.md)
- [`RoomListView`](../components/wardens/RoomListView.md)
- [`RoomDetailModal`](../components/wardens/RoomDetailModal.md)
- [`AllocateStudentModal`](../components/wardens/AllocateStudentModal.md)
- [`UpdateAllocationModal`](../components/common/students/UpdateAllocationModal.md)

## API Usage

- `hostelApi.getUnits(hostelId)`
- `hostelApi.getRooms(queryParams)`
- `hostelApi.getRoomsByUnit(unitId)`
- `hostelApi.updateRoomAllocations(allocations, hostelId)`

## Dependencies

- `react`: `useState`, `useEffect`
- `react-router-dom`: `Link`, `useParams`, `useNavigate`
- `react-icons`: `FaBuilding`, `FaDoorOpen`, `FaFileImport`, `MdFilterAlt`, `MdClearAll`, `MdMeetingRoom`
- `../services/hostelApi`
- Multiple components from `/src/components/common`, `/src/components/wardens`, `/src/components/common/students`
- `../contexts/AuthProvider`, `../contexts/GlobalProvider`, `../contexts/WardenProvider`
