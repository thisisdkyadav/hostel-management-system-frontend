# Hostel Card Component (`/src/components/admin/hostel/HostelCard.jsx`)

This component renders a visual card summarizing the key details of a single hostel. It's typically used in a grid or list display of multiple hostels.

## Purpose and Functionality

1.  **Data Display:**
    - Shows the hostel's name, gender, and type.
    - Displays the total number of rooms and the number of vacant rooms.
    - Shows the count of maintenance issues.
    - Renders a circular progress bar/gauge indicating the occupancy rate (`hostel.occupancyRate`).
    - Includes a colored icon based on the hostel's gender (`getTypeColor` helper function).
2.  **Actions:**
    - **Edit Details:** An "Edit Details" button toggles the visibility of the [`EditHostelModal`](./EditHostelModal.md). The `onSave` prop of the modal is connected to the `handleSaveHostel` function.
    - **View Details:** A "View Details" button acts as a `Link` (from `react-router-dom`) navigating the user to a specific hostel details page (`/admin/hostels/:hostelName`).
3.  **Edit Modal Handling:**
    - Uses `useState` (`showEditModal`) to control the visibility of the `EditHostelModal`.
    - The `handleSaveHostel` function receives the updated hostel data from the modal and calls the `onUpdate` prop function passed to `HostelCard`, allowing the parent component to handle the actual data update (e.g., API call and list refresh).

## Props

- `hostel` (Object): An object containing the details of the hostel to display. Expected properties include:
  - `name` (String)
  - `gender` (String: 'Boys', 'Girls', or other)
  - `type` (String, optional)
  - `totalRooms` (Number)
  - `vacantRooms` (Number)
  - `maintenanceIssues` (Number)
  - `occupancyRate` (Number: 0-100)
- `onUpdate` (Function): An async callback function invoked when the user saves changes in the `EditHostelModal`. It receives the `updatedHostel` object as an argument and should handle the persistence of these changes.

## State Management

- `showEditModal` (Boolean): Controls the visibility of the edit modal.

## Key Components Rendered

- [`EditHostelModal`](./EditHostelModal.md) (conditionally)

## Dependencies

- `react`: `useState`
- `react-icons/fa`: `FaBuilding`, `FaEdit`, `FaEye`, `FaTools`, `FaUserTie`
- `react-icons/md`: `MdMeetingRoom`
- `react-icons/bs`: `BsThreeDotsVertical` (Note: Imported but not used in the provided code snippet)
- `react-router-dom`: `Link`
- `./EditHostelModal`
