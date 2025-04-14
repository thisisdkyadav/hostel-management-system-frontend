# UpdateStudentsModal Component (`/src/components/common/students/UpdateStudentsModal.jsx`)

A multi-step modal dialog for bulk updating student information via CSV upload.

## Purpose and Functionality

This component facilitates updating multiple student records simultaneously by uploading a CSV file. It guides the user through a two-step process:

1.  **Step 1: File Upload & Validation**

    - Provides a UI for uploading a CSV file (drag-and-drop or click-to-select).
    - Includes a button to download a CSV template with the correct headers (`rollNumber` + `availableFields`).
    - Specifies required (`rollNumber`) and available update fields (`availableFields`).
    - Parses the uploaded CSV using `papaparse`.
    - Validates the CSV:
      - Checks for file type (`text/csv`).
      - Ensures the required `rollNumber` field is present.
      - Verifies that at least one updatable field is included.
      - Checks against a maximum record limit (e.g., 900).
    - Displays errors related to file type, missing fields, or parsing issues.
    - Shows instructions for field types.

2.  **Step 2: Preview & Confirmation**
    - Displays the parsed student data in a table preview using the `StudentTableView` component.
    - Allows viewing individual student details from the preview using the `StudentDetailModal`.
    - Provides a "Confirm Update" button to proceed with the bulk update.
    - Provides a "Back" button to return to the file upload step.

- **Update Execution:** Calls the `onUpdate` prop function with the `parsedData` array when the user confirms.
- **Loading States:** Shows indicators during CSV parsing (`isLoading`) and the final update process (`isUpdating`).
- **Reset:** Resets the form state when closed or after a successful update.

## Props

| Prop       | Type   | Description                                                                                                                                            | Default | Required |
| :--------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------- |
| `isOpen`   | `bool` | Controls the visibility of the modal.                                                                                                                  | -       | Yes      |
| `onClose`  | `func` | Callback function invoked when the modal requests to be closed.                                                                                        | -       | Yes      |
| `onUpdate` | `func` | Asynchronous callback function invoked when the user confirms the update. Receives the `parsedData` array. Should return a boolean indicating success. | -       | Yes      |

## Internal State

- `csvFile`: The selected File object.
- `parsedData`: Array of student objects parsed from the CSV.
- `isLoading`: Boolean, true during CSV parsing.
- `isUpdating`: Boolean, true during the final update via `onUpdate`.
- `error`: String storing validation or parsing error messages.
- `step`: Number indicating the current step (1 for upload, 2 for preview).
- `showStudentDetail`: Boolean controlling the visibility of the `StudentDetailModal`.
- `selectedStudent`: The student object passed to `StudentDetailModal`.

## CSV Structure

- **Identifier:** The `rollNumber` column is required and used to identify which student record to update.
- **Updatable Fields:** The CSV can contain any subset of the `availableFields`: `name`, `email`, `phone`, `password`, `profileImage`, `gender`, `dateOfBirth`, `degree`, `department`, `year`, `address`, `admissionDate`, `guardian`, `guardianPhone`, `guardianEmail`. Only columns corresponding to these fields will be processed for updates.

## Usage Example

```jsx
import React, { useState } from "react"
import UpdateStudentsModal from "./UpdateStudentsModal"
import Button from "../../common/Button"
import { studentApi } from "../../../services/apiService" // Example API service

function StudentManagementPage() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  const handleBulkUpdate = async (studentData) => {
    console.log("Attempting to update:", studentData)
    try {
      // Example: Call backend API to update students
      const response = await studentApi.bulkUpdateStudents(studentData)
      console.log("Update response:", response)
      alert(`Successfully updated ${response.updatedCount} students.`)
      // Potentially refresh the main student list here
      return true // Indicate success
    } catch (error) {
      console.error("Bulk update failed:", error)
      alert(`Bulk update failed: ${error.message}`)
      return false // Indicate failure
    }
  }

  return (
    <div className="p-4">
      {/* ... other management controls ... */}
      <Button onClick={() => setIsUpdateModalOpen(true)}>Bulk Update Students</Button>

      <UpdateStudentsModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} onUpdate={handleBulkUpdate} />
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
