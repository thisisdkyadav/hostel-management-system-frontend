# ImportStudentModal Component (`/src/components/common/students/ImportStudentModal.jsx`)

A multi-step modal dialog for bulk importing new student records via CSV upload.

## Purpose and Functionality

This component facilitates adding multiple new student records simultaneously by uploading a CSV file. It follows a two-step process similar to the update modals:

1.  **Step 1: File Upload & Validation**

    - Provides a UI for uploading a CSV file (drag-and-drop or click-to-select).
    - Includes a button to download a CSV template containing all `availableFields`.
    - Specifies required (`name`, `email`, `rollNumber`) and optional fields.
    - Parses the uploaded CSV using `papaparse`.
    - Validates the CSV:
      - Checks for file type (`text/csv`).
      - Ensures all required fields (`name`, `email`, `rollNumber`) are present.
      - Checks against a maximum record limit (e.g., 900).
    - Displays errors related to file type, missing fields, or parsing issues.
    - Shows instructions for field types.

2.  **Step 2: Preview & Confirmation**
    - Displays the parsed student data (potential new students) in a table preview using `StudentTableView`.
    - Allows viewing individual student details from the preview using `StudentDetailModal`.
    - Provides a "Confirm Import" button to proceed with adding the new students.
    - Provides a "Back" button to return to the file upload step.

- **Import Execution:** Calls the `onImport` prop function with the `parsedData` array when the user confirms.
- **Loading States:** Shows indicators during CSV parsing (`isLoading`) and the final import process (`isImporting`).
- **Reset:** Resets the form state when closed or after a successful import.

## Props

| Prop       | Type   | Description                                                                                                                                            | Default | Required |
| :--------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------- |
| `isOpen`   | `bool` | Controls the visibility of the modal.                                                                                                                  | -       | Yes      |
| `onClose`  | `func` | Callback function invoked when the modal requests to be closed.                                                                                        | -       | Yes      |
| `onImport` | `func` | Asynchronous callback function invoked when the user confirms the import. Receives the `parsedData` array. Should return a boolean indicating success. | -       | Yes      |

## Internal State

- `csvFile`: The selected File object.
- `parsedData`: Array of student objects parsed from the CSV, ready for import.
- `isLoading`: Boolean, true during CSV parsing.
- `isImporting`: Boolean, true during the final import via `onImport`.
- `error`: String storing validation or parsing error messages.
- `step`: Number indicating the current step (1 for upload, 2 for preview).
- `showStudentDetail`: Boolean controlling the visibility of the `StudentDetailModal`.
- `selectedStudent`: The student object passed to `StudentDetailModal`.

## CSV Structure

- **Required Fields:** `name`, `email`, `rollNumber`.
- **Optional Fields:** All other fields listed in `availableFields` (`phone`, `password`, `profileImage`, `gender`, `dateOfBirth`, `degree`, `department`, `year`, `address`, `admissionDate`, `guardian`, `guardianPhone`, `guardianEmail`) can be included.
- Fields not present in the CSV will default to empty strings (except `admissionDate`, which defaults to the current date if missing).

## Usage Example

```jsx
import React, { useState } from "react"
import ImportStudentModal from "./ImportStudentModal"
import Button from "../../common/Button"
import { studentApi } from "../../../services/apiService" // Example API service

function StudentManagementPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handleBulkImport = async (newStudentData) => {
    console.log("Attempting to import:", newStudentData)
    try {
      // Example: Call backend API to add new students
      const response = await studentApi.bulkImportStudents(newStudentData)
      console.log("Import response:", response)
      alert(`Successfully imported ${response.importedCount} new students.`)
      // Potentially refresh the main student list here
      return true // Indicate success
    } catch (error) {
      console.error("Bulk import failed:", error)
      alert(`Bulk import failed: ${error.message}`)
      return false // Indicate failure
    }
  }

  return (
    <div className="p-4">
      {/* ... other management controls ... */}
      <Button onClick={() => setIsImportModalOpen(true)}>Import New Students</Button>

      <ImportStudentModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleBulkImport} />
    </div>
  )
}
```

## Dependencies

- [`./StudentTableView`](./StudentTableView.md): Used to display the preview table.
- [`./StudentDetailModal`](./StudentDetailModal.md): Used to show details of a student from the preview.
- [`../../common/Modal`](../Modal.md): Base modal component.
- `papaparse`: For CSV parsing.
- `react-icons/fa`: Uses `FaFileUpload`, `FaCheck`, `FaTimes`, `FaFileDownload` icons.
