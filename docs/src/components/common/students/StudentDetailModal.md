# StudentDetailModal Component (`/src/components/common/students/StudentDetailModal.jsx`)

A modal dialog displaying detailed information about a selected student across multiple tabs.

## Purpose and Functionality

This component provides a comprehensive view of a student's record. It is used both for viewing existing students and for previewing student data during bulk import/update operations.

- **Data Display:** Shows detailed student information categorized into tabs:
  - **Profile:** Basic info (name, roll, contact), academic info, hostel info, personal info (gender, DOB, address), guardian info.
  - **Complaints:** Fetches and lists recent complaints filed by the student.
  - **Access History:** Fetches and lists recent entry/exit records for the student.
  - **Visitor Requests:** Fetches and lists recent visitor requests associated with the student.
  - **Feedback:** Fetches and lists feedback submitted by the student.
  - **Disciplinary Actions:** Renders the `DisCoActions` component to show and manage disciplinary records.
- **Data Fetching:** Fetches relevant data for each tab on demand when the tab becomes active (using `studentApi`, `visitorApi`, `securityApi`, `feedbackApi`). Skips fetching if `isImport` is true.
- **Import Preview:** If `isImport` is true, it displays the data passed in via the `selectedStudent` prop without fetching from the API.
- **Editing:** Includes an "Edit Student" button (if not in import mode) that opens the `EditStudentModal`.
- **Loading States:** Displays loading indicators while fetching data for the profile or individual tabs.
- **Empty States:** Shows appropriate messages within tabs if no data is found (e.g., "No complaints found").

## Props

| Prop                   | Type     | Description                                                                                                                              | Default     | Required |
| :--------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :---------- | :------- |
| `selectedStudent`      | `object` | The student object containing initial data (at least `userId` or full details if `isImport` is true).                                    | -           | Yes      |
| `setShowStudentDetail` | `func`   | Callback function to close this modal (likely by setting a parent state variable to `false`).                                            | -           | Yes      |
| `onUpdate`             | `func`   | Optional callback function invoked after a successful update via the `EditStudentModal`. Typically used to refresh the parent list/data. | `undefined` | No       |
| `isImport`             | `bool`   | If `true`, indicates the modal is used for previewing imported data. Data fetching for existing records is skipped.                      | `false`     | No       |

## Internal State

- `studentDetails`: Stores the comprehensive details fetched for the profile tab.
- `loading`: Boolean, true while fetching initial profile details.
- `showEditModal`: Boolean controlling the visibility of the `EditStudentModal`.
- `activeTab`: String indicating the currently selected tab ('profile', 'complaints', etc.).
- `complaints`, `accessRecords`, `visitorRequests`, `feedbacks`: Arrays storing data fetched for respective tabs.
- `loadingComplaints`, `loadingAccessRecords`, etc.: Booleans indicating loading state for each tab's data.

## Key Functions

- `fetchStudentDetails`: Fetches core student details (if not in import mode).
- `fetchStudentComplaints`, `fetchStudentAccessHistory`, etc.: Fetch data specifically for each tab when activated.
- `formatDate`, `formatDateTime`: Utility functions for displaying dates.
- `renderTabContent`: Renders the appropriate content based on the `activeTab`.

## Usage Example

Used from components that display lists of students (e.g., tables, bulk import previews) to show more details on click.

```jsx
// Example within a component displaying a student list
import React, { useState } from "react"
import StudentDetailModal from "./StudentDetailModal"

function StudentListPage() {
  const [students, setStudents] = useState([]) // Assume fetched elsewhere
  const [selectedStudentData, setSelectedStudentData] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleViewDetails = (student) => {
    // Need userId for fetching, or pass full object if previewing
    setSelectedStudentData({ userId: student._id, ...student })
    setIsDetailModalOpen(true)
  }

  const handleModalClose = () => {
    setIsDetailModalOpen(false)
    setSelectedStudentData(null)
  }

  const handleStudentUpdate = () => {
    // Logic to refresh the student list after an update
    console.log("Student updated, refreshing list...")
    // fetchStudents();
  }

  return (
    <div>
      {/* ... List/Table rendering students ... */}
      {/* Example: <button onClick={() => handleViewDetails(student)}>View</button> */}

      {isDetailModalOpen && selectedStudentData && (
        <StudentDetailModal
          selectedStudent={selectedStudentData}
          setShowStudentDetail={handleModalClose} // Pass function to close modal
          onUpdate={handleStudentUpdate} // Pass function to handle refresh
        />
      )}
    </div>
  )
}
```

## Dependencies

- [`./EditStudentModal`](./EditStudentModal.md): Modal for editing student details.
- [`./DisCoActions`](./DisCoActions.md): Component for displaying/managing disciplinary actions.
- [`../../common/Modal`](../Modal.md): Base modal component.
- [`../../../services/apiService.js`](../../../services/README.md): Uses `studentApi`.
- [`../../../services/visitorApi.js`](../../../services/README.md): Uses `visitorApi`.
- [`../../../services/securityApi.js`](../../../services/README.md): Uses `securityApi`.
- [`../../../services/feedbackApi.js`](../../../services/README.md): Uses `feedbackApi`.
- `react-icons/fa`: Uses various icons.
