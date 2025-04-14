# CsvUploader Component (`/src/components/common/CsvUploader.jsx`)

A component for uploading, parsing, and validating CSV files, with template download functionality.

## Purpose and Functionality

This component provides a user-friendly interface for handling CSV file uploads. Its key features include:

- **File Input:** Supports both drag-and-drop and traditional file selection via click.
- **Validation:**
  - Checks if the uploaded file is of type `text/csv`.
  - Verifies that the CSV header row contains all fields specified in the `requiredFields` prop.
  - Ensures the number of data records does not exceed the `maxRecords` limit.
- **Parsing:** Uses the `papaparse` library to parse the CSV data into an array of objects.
- **Callback:** Invokes the `onDataParsed` function with the successfully parsed and validated data.
- **Error Handling:** Displays specific error messages for invalid file types, missing fields, exceeding record limits, or parsing errors.
- **Template Download:** Allows users to download a pre-defined CSV template file using the `templateHeaders` and `templateFileName` props.
- **State Display:** Shows loading indicators during parsing and displays the name of the selected file with an option to remove/reset it.
- **Instructions:** Can display optional `instructionText`.

## Props

| Prop               | Type     | Description                                                                                    | Default     | Required |
| :----------------- | :------- | :--------------------------------------------------------------------------------------------- | :---------- | :------- |
| `onDataParsed`     | `func`   | Callback function invoked with the parsed data (array of objects) after successful validation. | -           | Yes      |
| `requiredFields`   | `array`  | An array of strings listing the header names that _must_ be present in the uploaded CSV file.  | -           | Yes      |
| `templateFileName` | `string` | The desired filename for the downloadable CSV template (e.g., `"students-template.csv"`).      | -           | Yes      |
| `templateHeaders`  | `array`  | An array of strings representing the header row for the downloadable CSV template.             | -           | Yes      |
| `maxRecords`       | `number` | The maximum number of data rows (excluding the header) allowed in the CSV file.                | `500`       | No       |
| `instructionText`  | `string` | Optional text displayed below the uploader area to provide guidance to the user.               | `undefined` | No       |

## Usage Example

```jsx
import React, { useState } from "react"
import CsvUploader from "./CsvUploader"
import studentService from "../services/studentService" // Example service

const REQUIRED_STUDENT_FIELDS = ["studentId", "name", "email", "roomNumber"]
const STUDENT_TEMPLATE_HEADERS = ["studentId", "name", "email", "roomNumber", "phoneNumber"]

function BulkAddStudents() {
  const [uploadStatus, setUploadStatus] = useState("")

  const handleDataParsed = async (parsedData) => {
    console.log("Parsed Data:", parsedData)
    setUploadStatus(`Processing ${parsedData.length} records...`)
    try {
      // Example: Send data to backend API
      const response = await studentService.bulkAddStudents(parsedData)
      setUploadStatus(`Successfully added ${response.addedCount} students.`)
    } catch (error) {
      setUploadStatus(`Error uploading students: ${error.message}`)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Bulk Upload Students via CSV</h2>
      <CsvUploader
        onDataParsed={handleDataParsed}
        requiredFields={REQUIRED_STUDENT_FIELDS}
        templateFileName="students-template.csv"
        templateHeaders={STUDENT_TEMPLATE_HEADERS}
        maxRecords={1000} // Override default
        instructionText="Ensure the studentId is unique for each student. Phone number is optional."
      />
      {uploadStatus && <p className="mt-4 text-sm text-gray-700">{uploadStatus}</p>}
    </div>
  )
}
```

## Dependencies

- `papaparse`: Library used for parsing CSV files.
- `react-icons/fa`: Uses `FaFileUpload`, `FaTimes`, `FaFileDownload` icons.
