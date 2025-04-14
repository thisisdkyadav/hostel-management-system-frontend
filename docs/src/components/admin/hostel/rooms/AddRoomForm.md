# Add Room Form Component (`/src/components/admin/hostel/rooms/AddRoomForm.jsx`)

This component renders a form used within the `RoomManagementModal` to manually add one or more rooms to a specific hostel.

## Purpose and Functionality

1.  **Hostel Type Adaptation:** Checks the `hostel.type` prop to determine if the hostel is "unit-based". This flag (`isUnitBased`) controls the visibility and labeling of certain fields (e.g., Unit Number, Room Letters vs. Room Numbers).
2.  **Input Fields:**
    - **Unit Number:** (Conditional, only for unit-based) Text input for the unit number (e.g., 101).
    - **Common Area Details:** (Conditional, only for unit-based) Textarea for optional details about the unit's common area.
    - **Room Numbers/Letters:** Text input where users can enter:
      - Single room identifiers (e.g., "A" or "101").
      - Comma-separated lists (e.g., "A, B, D" or "101, 103, 205").
      - Hyphenated ranges (e.g., "A-E" or "101-105").
      - Combinations (e.g., "A-C, E" or "101-103, 105").
    - **Capacity:** Number input for the number of occupants per room (min 1).
    - **Status:** Dropdown to select the room status (e.g., "Active", "Inactive").
3.  **State Management:**
    - `formData`: Stores the current values of all input fields.
    - `errors`: Stores validation error messages for each field and a general form error.
    - `successMessage`: Stores a success message displayed after successfully adding rooms.
4.  **Input Handling:** `handleChange` updates `formData`, converts capacity to an integer, clears relevant errors, and clears the success message.
5.  **Client-Side Validation:** `validateForm` checks for required fields (Unit Number if applicable, Room Numbers/Letters, Status) and valid capacity. Sets the `errors` state.
6.  **Room Number Parsing:**
    - `parseRoomNumbers` takes the `roomNumbers` string from `formData`.
    - It splits the string by commas and then processes each segment.
    - If a segment contains a hyphen, it attempts to expand the range:
      - For unit-based: Expands letter ranges (e.g., "A-C" becomes `['A', 'B', 'C']`).
      - For room-only: Expands numeric ranges (e.g., "101-103" becomes `['101', '102', '103']`).
      - Invalid ranges are treated as individual items (e.g., "A-1" might become `['A', '1']`).
    - Returns an array of individual room identifiers.
7.  **Submission Handling:**
    - `handleSubmit` prevents default submission and validates the form.
    - Calls `parseRoomNumbers` to get the list of rooms to add.
    - Constructs an array `roomsToAdd` containing objects for each room, including `unitNumber` (if applicable), `roomNumber`, `capacity`, and `status`.
    - For unit-based hostels, it also constructs a `unitsToAdd` array. It currently seems to assume a new unit needs to be added based _only_ on the `unitNumber` entered in the form, deriving the floor from the first digit. It includes `commonAreaDetails`. **Note:** This might need refinement if units can already exist.
    - Sets the `isLoading` prop to `true`.
    - Calls the `hostelApi.addRooms` service, passing the `hostel.id` and an object containing `{ rooms: roomsToAdd, units: unitsToAdd }` (units only if applicable).
    - On success: Sets the `successMessage`, calls the `onRoomsUpdated` prop, and resets the form.
    - On failure: Sets a form-level error message in the `errors` state.
    - Sets `isLoading` prop back to `false` in a `finally` block.
8.  **UI Feedback:** Displays success and error messages, highlights input fields with errors.

## Props

- `hostel` (Object): The hostel object to which rooms are being added. Used to determine `type` (unit-based/room-only) and `id` for the API call.
- `onRoomsUpdated` (Function): Callback function invoked after rooms have been successfully added via the API. Likely used to trigger a refresh in the parent component.
- `setIsLoading` (Function): Callback function to set the loading state in the parent `RoomManagementModal`, potentially disabling parts of the UI or showing an indicator elsewhere.

## State Management

- `formData` (Object): `{ unitNumber: String, roomNumbers: String, capacity: Number, status: String, commonAreaDetails: String }`
- `errors` (Object): `{ unitNumber?: String, roomNumbers?: String, capacity?: String, status?: String, form?: String }`
- `successMessage` (String)

## API Usage

- `hostelApi.addRooms(hostelId, { rooms, units? })`: Called on form submission.

## Dependencies

- `react`: `useState`
- `../../../common/Button`
- `react-icons/fa`: `FaDoorOpen`, `FaUsers`, `FaPlusCircle`
- `../../../../services/hostelApi`
