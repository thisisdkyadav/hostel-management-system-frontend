# Room Only Form Component (`/src/components/admin/forms/RoomOnlyForm.jsx`)

This component provides a form interface specifically for defining the room structure of a "Room Only" type hostel during creation or editing.

## Purpose and Functionality

This component allows administrators to define the rooms within a hostel using one of two methods, selected via toggle buttons:

1.  **Form Input (`inputMethod === 'form'`):**
    - Collects configuration details: Number of floors, default rooms per floor, standard room capacity.
    - Allows defining exceptions to override the default number of rooms for specific floors.
    - As the configuration changes (`handleChange`, `handleExceptionChange`, `addException`, `removeException`), the `updateFormDataWithConfig` function calculates the resulting list of rooms.
    - Room numbers are generated automatically (e.g., 101, 102... for floor 1; 201, 202... for floor 2).
    - Calls the `setFormData` prop function to update the `rooms` array in the parent component's state.
2.  **CSV Import (`inputMethod === 'csv'`):**
    - Renders the [`CsvUploader`](../../common/CsvUploader.md) component, configured for room data (requires `roomNumber`, `capacity` fields).
    - When a CSV is parsed (`handleCsvDataParsed`), it processes the data to ensure correct field names and types.
    - Calls the `setFormData` prop function to update the `rooms` array in the parent component's state with the processed CSV data.
    - Displays a summary of the imported data using the [`RoomStatsSummary`](./RoomStatsSummary.md) component.

## Props

- `formData` (Object): The current form data object from the parent component (likely `AddHostelModal` or similar). This component reads from it indirectly (via initial state perhaps) and writes back to it.
- `setFormData` (Function): A callback function provided by the parent component to update its form data state. This component calls it with the updated `rooms` array whenever the configuration or imported data changes.

## State Management

- `inputMethod`: Tracks whether "Form Input" or "CSV Import" is selected.
- `roomConfig`: Stores the configuration values when using the form input method (floors, defaults, capacity, exceptions).
- `parsedCsvData`: Stores the processed data from the CSV uploader for summary display.

## Key Components Rendered

- [`CsvUploader`](../../common/CsvUploader.md) (conditionally rendered)
- [`RoomStatsSummary`](./RoomStatsSummary.md) (conditionally rendered)

## Dependencies

- `react`: `useState`
- `react-icons/fa`: `FaTable`, `FaEdit`
- `../../common/CsvUploader`
- `./RoomStatsSummary`
