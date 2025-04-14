# Unit Based Form Component (`/src/components/admin/forms/UnitBasedForm.jsx`)

This component provides a form interface specifically for defining the structure (units and rooms) of a "Unit Based" type hostel during creation or editing.

## Purpose and Functionality

This component allows administrators to define the units and rooms within a hostel using one of two methods, selected via toggle buttons:

1.  **Form Input (`inputMethod === 'form'`):**
    - Collects configuration details: Number of floors, default units per floor, default rooms per unit, standard room capacity.
    - Allows specifying the exact number of units for each floor, overriding the default.
    - Allows defining exceptions to override the default number of rooms for specific units.
    - As the configuration changes (`handleChange`, `handleExceptionChange`, `addException`, `removeException`), the `updateFormDataWithConfig` function calculates the resulting list of `units` and `rooms`.
    - Unit numbers are generated automatically (e.g., 101, 102... for floor 1; 201, 202... for floor 2).
    - Room numbers within a unit are generated as letters (A, B, C...).
    - Calls the `setFormData` prop function to update the `units` and `rooms` arrays in the parent component's state.
    - Displays a calculated total capacity based on the configuration.
2.  **CSV Import (`inputMethod === 'csv'`):**
    - Renders the [`CsvUploader`](../../common/CsvUploader.md) component, configured for room data within units (requires `unitNumber`, `roomNumber`, `capacity` fields).
    - When a CSV is parsed (`handleCsvDataParsed`), it processes the data to ensure correct field names/types and extracts unique unit numbers.
    - Generates both the `rooms` array (from processed CSV data) and the `units` array (derived from unique unit numbers).
    - Calls the `setFormData` prop function to update the `units` and `rooms` arrays in the parent component's state.
    - Displays a summary of the imported data using the [`RoomStatsSummary`](./RoomStatsSummary.md) component (with `isUnitBased={true}`).

## Props

- `formData` (Object): The current form data object from the parent component (likely `AddHostelModal` or similar).
- `setFormData` (Function): A callback function provided by the parent component to update its form data state. This component calls it with the updated `units` and `rooms` arrays.

## State Management

- `inputMethod`: Tracks whether "Form Input" or "CSV Import" is selected.
- `unitConfig`: Stores the configuration values when using the form input method (floors, defaults, capacity, unitsPerFloor map, exceptions).
- `parsedCsvData`: Stores the processed data from the CSV uploader for summary display.

## Key Components Rendered

- [`CsvUploader`](../../common/CsvUploader.md) (conditionally rendered)
- [`RoomStatsSummary`](./RoomStatsSummary.md) (conditionally rendered)

## Dependencies

- `react`: `useState`, `useEffect`
- `react-icons/fa`: `FaTable`, `FaEdit`
- `../../common/CsvUploader`
- `./RoomStatsSummary`
