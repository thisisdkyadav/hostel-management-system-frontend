# Add Rooms via CSV Component (`/src/components/admin/hostel/rooms/AddRoomsCsv.jsx`)

This component provides the interface for adding multiple rooms to a hostel by uploading and processing a CSV file. It's used within the `RoomManagementModal`.

## Purpose and Functionality

1.  **CSV Upload:** Renders the [`CsvUploader`](../../../common/CsvUploader.md) component.
    - Configures `CsvUploader` with required fields based on the `hostel.type` (`isUnitBased` flag).
    - Provides specific template file names (`unit_based_rooms_template.csv` or `room_only_template.csv`) and instructions for the expected CSV format.
2.  **Data Parsing and Processing:**
    - The `handleCsvDataParsed` function receives the raw parsed data from `CsvUploader`.
    - It processes each row:
      - Assigns `unitNumber` only if `isUnitBased`.
      - Ensures `roomNumber` is a string.
      - Parses `capacity` to an integer (defaults to 1).
      - Validates `status` against allowed values ("Active", "Inactive", "Maintenance"), defaulting to "Active".
    - Stores the processed data in the `parsedCsvData` state.
    - Clears any previous success or error messages.
3.  **Data Preview:**
    - If `parsedCsvData` contains data (i.e., a CSV has been successfully parsed), it displays:
      - A preview header.
      - The [`RoomStatsSummary`](../../forms/RoomStatsSummary.md) component, showing statistics calculated from the parsed data.
      - An "Add Room(s)" button.
4.  **Submission:**
    - The `handleAddRooms` function is triggered by the "Add Room(s)" button.
    - It checks if there is parsed data available; if not, it sets an error.
    - Sets the `setIsLoading` prop to `true`.
    - Calls the `adminApi.addRooms` service, passing the `hostel.id` and the `parsedCsvData` array.
    - **Note:** The API endpoint `adminApi.addRooms` used here seems to expect an array of room objects directly, unlike `AddRoomForm` which sends `{ rooms: ..., units: ... }`. This might imply the backend handles unit creation/association differently for CSV uploads or there's an inconsistency.
    - On success: Sets a `successMessage`, calls the `onRoomsUpdated` prop, and clears `parsedCsvData` (resetting the view).
    - On failure: Sets an error message in the `error` state.
    - Sets `setIsLoading` back to `false` in a `finally` block.
5.  **UI Feedback:** Displays success and error messages.

## Props

- `hostel` (Object): The hostel object to which rooms are being added. Used to determine `type` (unit-based/room-only) and `id` for the API call.
- `onRoomsUpdated` (Function): Callback function invoked after rooms have been successfully added via the API.
- `setIsLoading` (Function): Callback function to set the loading state in the parent `RoomManagementModal`.

## State Management

- `parsedCsvData` (Array): Stores the processed room data extracted from the uploaded CSV.
- `successMessage` (String): Message shown on successful submission.
- `error` (String): Error message shown on parsing or submission failure.

## Key Components Rendered

- [`CsvUploader`](../../../common/CsvUploader.md)
- [`RoomStatsSummary`](../../forms/RoomStatsSummary.md) (conditionally)
- [`Button`](../../../common/Button.md) (conditionally)

## API Usage

- `adminApi.addRooms(hostelId, parsedCsvData)`: Called when the user confirms the addition of rooms from the parsed CSV.

## Dependencies

- `react`: `useState`
- `../../../common/CsvUploader`
- `../../forms/RoomStatsSummary`
- `../../../common/Button`
- `react-icons/fa`: `FaUpload`
- `../../../../services/apiService`: `adminApi`
