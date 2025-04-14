# Wardens Components (`/src/components/wardens`)

This directory contains components specifically designed for the Warden user interface, primarily focusing on room and allocation management within their assigned hostel(s).

## Component Overview

- **[`UnitStats.jsx`](./UnitStats.md) / [`RoomStats.jsx`](./RoomStats.md)**

  - **Summary:** Displays summary statistics about hostel units or rooms (e.g., total rooms, occupancy, available beds).
  - _Future Files:_ `./UnitStats.md`, `./RoomStats.md`

- **[`UnitFilterSection.jsx`](./UnitFilterSection.md)**

  - **Summary:** Renders filter controls specifically for unit-based views (if applicable), allowing filtering by unit number, occupancy status, etc.
  - _Future File:_ `./UnitFilterSection.md`

- **[`UnitListView.jsx`](./UnitListView.md) / [`RoomListView.jsx`](./RoomListView.md)**

  - **Summary:** Components for displaying lists of units or rooms, potentially in table or card formats.
  - _Future Files:_ `./UnitListView.md`, `./RoomListView.md`

- **[`UnitCard.jsx`](./UnitCard.md) / [`RoomCard.jsx`](./RoomCard.md)**

  - **Summary:** Renders individual cards representing a hostel unit or a specific room, showing key details and potentially actions.
  - _Future Files:_ `./UnitCard.md`, `./RoomCard.md`

- **[`RoomDetailModal.jsx`](./RoomDetailModal.md)**

  - **Summary:** A modal dialog displaying detailed information about a specific room, including assigned students, bed status, and potentially room-specific actions.
  - _Future File:_ `./RoomDetailModal.md`

- **[`AllocateStudentModal.jsx`](./AllocateStudentModal.md)**

  - **Summary:** A modal dialog facilitating the allocation of a specific student to a selected room/bed.
  - _Future File:_ `./AllocateStudentModal.md`

- **[`BedSelectionComponent.jsx`](./BedSelectionComponent.md)**

  - **Summary:** A component likely used within allocation modals (`AllocateStudentModal`, `RoomDetailModal`) to visually represent and select available beds within a room.
  - _Future File:_ `./BedSelectionComponent.md`

- **[`room/`](./room/README.md)**
  - **Summary:** Likely contains further components specifically related to room details or management actions within the warden interface.
  - _Future File:_ `./room/README.md`

## Structure Notes

These components form the core UI for wardens managing their hostel(s), typically integrated into pages displaying room layouts, allocation lists, or student management within the hostel context.
