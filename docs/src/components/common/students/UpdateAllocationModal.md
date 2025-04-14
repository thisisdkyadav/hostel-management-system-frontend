# UpdateAllocationModal Component (`/src/components/common/students/UpdateAllocationModal.jsx`)

A multi-step modal dialog for bulk updating student room allocations via CSV upload.

## Purpose and Functionality

This component allows administrators to update room and bed assignments for multiple students simultaneously using a CSV file. It follows a multi-step process:

1.  **Step 1: Hostel Selection, File Upload & Validation**

    - Requires selecting a target hostel from a dropdown (populated using `hostelList` from `GlobalProvider`).
    - Provides a UI for uploading a CSV file (drag-and-drop or click-to-select) _after_ a hostel is selected.
    - Includes a button to download a CSV template with the correct headers based on the selected hostel's type (includes `unit` for unit-based hostels).
    - Specifies required fields: `rollNumber`, `room`, `bedNumber`, and `unit` (if hostel is unit-based).
    - Parses the uploaded CSV using `papaparse`.
    - Validates the CSV:
      - Checks for file type (`text/csv`).
      - Ensures all required fields are present.
      - Checks against a maximum record limit (e.g., 900).
    - Displays errors related to missing hostel selection, file type, missing fields, or parsing issues.
    - Shows instructions for field types.

2.  **Step 2: Preview & Confirmation**
    - Displays the parsed allocation data (including a constructed `displayRoom` field) in a table preview using `StudentTableView`.
    - Allows viewing individual student details from the preview using `StudentDetailModal`.
    - Provides a "Confirm Allocation" button to proceed with the bulk update.
    - Provides a "Back" button to return to the file upload step.

- **Allocation Execution:** Performs a final check (e.g., ensuring `unit` is present for unit-based hostels) and then calls the `onAllocate` prop function with the `parsedData` array and the selected `hostelId` when the user confirms.
- **Loading States:** Shows indicators during CSV parsing (`isLoading`) and the final allocation process (`isAllocating`).
- **Reset:** Resets the form state (including hostel selection) when closed or after a successful allocation.

## Props

| Prop         | Type   | Description                                                                                                                                                           | Default | Required |
| :----------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------- |
| `isOpen`     | `bool` | Controls the visibility of the modal.                                                                                                                                 | -       | Yes      |
| `onClose`    | `func` | Callback function invoked when the modal requests to be closed. Receives `false` as an argument upon successful allocation.                                           | -       | Yes      |
| `onAllocate` | `func` | Asynchronous callback function invoked when the user confirms the allocation. Receives `parsedData` array and `hostelId`. Should return a boolean indicating success. | -       | Yes      |

## Internal State

- `selectedHostel`: The hostel object selected from the dropdown.
- `hostelId`: The ID of the selected hostel.
- `hostelType`: The type ('unit-based' or other) of the selected hostel.
- `csvFile`: The selected File object.
- `parsedData`: Array of allocation objects parsed from the CSV.
- `isLoading`: Boolean, true during CSV parsing.
- `isAllocating`: Boolean, true during the final allocation via `onAllocate`.
- `error`: String storing validation or parsing error messages.
- `step`: Number indicating the current step (1 for upload, 2 for preview).
- `showStudentDetail`: Boolean controlling the visibility of the `StudentDetailModal`.
- `selectedStudent`: The student object passed to `StudentDetailModal`.

## CSV Structure

- **Required Fields:** `rollNumber`, `room`, `bedNumber`.
- **Conditional Field:** `unit` is also required if the selected hostel is `unit-based`.

## Usage Example

```jsx
import React, { useState } from "react"
import UpdateAllocationModal from "./UpdateAllocationModal"
import Button from "../common/Button"
import { allocationApi } from "../../services/apiService" // Example API service

function RoomManagementPage() {
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false)

  const handleBulkAllocate = async (allocationData, hostelId) => {
    console.log(`Attempting to allocate for hostel ${hostelId}:`, allocationData)
    try {
      // Example: Call backend API to update allocations
      const response = await allocationApi.bulkAllocateRooms(hostelId, allocationData)
      console.log("Allocation response:", response)
      alert(`Successfully allocated rooms for ${response.allocatedCount} students.`)
      // Potentially refresh room/student data here
      return true // Indicate success
    } catch (error) {
      console.error("Bulk allocation failed:", error)
      alert(`Bulk allocation failed: ${error.message}`)
      return false // Indicate failure
    }
  }

  return (
    <div className="p-4">
      {/* ... other management controls ... */}
      <Button onClick={() => setIsAllocateModalOpen(true)}>Bulk Update Allocations</Button>

      <UpdateAllocationModal
        isOpen={isAllocateModalOpen}
        onClose={(success) => {
          setIsAllocateModalOpen(false)
          if (success) {
            /* Potentially refresh data */
          }
        }}
        onAllocate={handleBulkAllocate}
      />
    </div>
  )
}
```

## Dependencies

- [`./StudentTableView`](./StudentTableView.md): Used to display the preview table.
- [`./StudentDetailModal`](./StudentDetailModal.md): Used to show details of a student from the preview.
- [`../common/Modal`](../Modal.md): Base modal component.
- [`../../../contexts/GlobalProvider`](../../../contexts/README.md): Uses `useGlobal` to get `hostelList`.
- `papaparse`: For CSV parsing.
- `react-icons/fa`: Uses `FaFileUpload`, `FaCheck`, `FaTimes`, `FaFileDownload` icons.
