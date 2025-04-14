# Bulk Update Rooms Modal Component (`/src/components/admin/hostel/rooms/BulkUpdateRoomsModal.jsx`)

This component renders a modal for performing bulk updates on existing rooms within a hostel via CSV upload.

## Purpose and Functionality

1.  **Modal Display:** Uses the common `Modal` component, controlled by the `show` prop.
2.  **Critical Warnings:** Prominently displays warnings about:
    - **Allocation Loss:** Updating rooms deletes associated allocations permanently.
    - **Update Limitations:** Only one attribute (status or capacity) can be updated per room per upload. Status updates take priority.
    - **Capacity Restrictions:** Capacity cannot be changed for inactive rooms.
3.  **CSV Upload:** Renders the [`CsvUploader`](../../../common/CsvUploader.md) component.
    - Requires `roomNumber` and, if `isUnitBased`, `unitNumber` to identify the rooms to update.
    - `capacity` and `status` columns are optional; if present, their values will be used for the update.
    - Provides specific template file names and instructions.
4.  **Data Parsing & Processing:**
    - `handleCsvDataParsed` receives data from `CsvUploader`.
    - Processes each row, keeping only the identification fields (`unitNumber`, `roomNumber`) and optional update fields (`capacity`, `status`). Parses capacity, validates status.
    - Stores the result in `parsedCsvData`.
5.  **Data Preview:**
    - If `parsedCsvData` is populated, it displays:
      - A preview header indicating the number of rooms to be updated.
      - A table showing the first 5 rows of the parsed data, including the values to be updated (or lack thereof).
6.  **Confirmation Requirement:**
    - Includes a checkbox that the user _must_ check to proceed.
    - The label explicitly states understanding that allocations will be deleted.
7.  **Submission Handling:**
    - `handleBulkUpdate` is triggered by the "Update Room(s)" button.
    - Checks if data exists and if the confirmation checkbox is checked; sets errors if not.
    - Sets the `setIsLoading` prop to `true`.
    - Calls the `hostelApi.bulkUpdateRooms` service with the `hostel.id` and the `parsedCsvData`.
    - On success: Shows a `successMessage`, calls `onRoomsUpdated`, and then calls `onClose` after a 2-second delay.
    - On failure: Sets an `error` message (using the message from the API response if available).
    - Sets `setIsLoading` back to `false` in a `finally` block.
8.  **UI Feedback:** Displays success and error messages. The update button is disabled until data is parsed and the confirmation checkbox is checked.

## Props

- `show` (Boolean): Controls the visibility of the modal. If `false`, the component returns `null`.
- `onClose` (Function): Callback function invoked to close the modal (e.g., user clicks Cancel, backdrop, or after successful update).
- `hostel` (Object): The hostel object whose rooms are being updated. Used for `id` and `type`.
- `onRoomsUpdated` (Function): Callback function invoked after rooms have been successfully updated via the API.
- `setIsLoading` (Function): Callback function to set the loading state in the parent component (likely `ExistingRoomsList`).

## State Management

- `parsedCsvData` (Array): Stores the processed room data from the CSV, containing identification and update values.
- `confirmed` (Boolean): Tracks the state of the confirmation checkbox.
- `error` (String): Error message string.
- `successMessage` (String): Success message string.

## Key Components Rendered

- [`Modal`](../../../common/Modal.md)
- [`CsvUploader`](../../../common/CsvUploader.md)
- [`Button`](../../../common/Button.md)

## API Usage

- `hostelApi.bulkUpdateRooms(hostelId, parsedCsvData)`: Called upon confirmed submission.

## Dependencies

- `react`: `useState`
- `../../../common/Modal`
- `../../../common/CsvUploader`
- `../../../common/Button`
- `react-icons/fa`: `FaExclamationTriangle`, `FaUpload`
- `../../../../services/hostelApi`
