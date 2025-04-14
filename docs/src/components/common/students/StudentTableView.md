# StudentTableView Component (`/src/components/common/students/StudentTableView.jsx`)

A component that displays a list of students in a table format, built upon `BaseTable`.

## Purpose and Functionality

This component provides a specialized table view for displaying student data. It configures the `BaseTable` component with specific columns relevant to students and includes features like:

- **Pre-defined Columns:** Sets up columns for:
  - Student (Name, Email, Profile Image)
  - Roll Number
  - Hostel (Hidden on medium screens and below)
  - Room (using `displayRoom` key, hidden on small screens and below)
  - Actions (View Details button)
- **Custom Rendering:** Uses custom render functions for the Student column (to show image, name, email) and the Hostel column (to display as a badge).
- **Sorting:** Implements sortable headers for the "Student" (by name) and "Hostel" columns, displaying sort direction icons and triggering the `handleSort` prop function.
- **Actions:** Includes a "View Details" button (`FaEye` icon) in each row that triggers the `viewStudentDetails` prop function.

## Props

| Prop                 | Type     | Description                                                                                                                                                                           | Default | Required |
| :------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------ | :------- |
| `currentStudents`    | `array`  | An array of student objects to display in the table. Each object should have keys used by the columns (`name`, `email`, `profileImage`, `rollNumber`, `hostel`, `displayRoom`, etc.). | -       | Yes      |
| `sortField`          | `string` | The key of the currently sorted column (e.g., 'name', 'hostel'). Used to display the sort indicator.                                                                                  | -       | Yes      |
| `sortDirection`      | `string` | The current sort direction ('asc' or 'desc'). Used to display the sort indicator.                                                                                                     | -       | Yes      |
| `handleSort`         | `func`   | Callback function invoked when a sortable column header is clicked. Receives the column key (`name` or `hostel`) as an argument.                                                      | -       | Yes      |
| `viewStudentDetails` | `func`   | Callback function invoked when the "View Details" button in a row is clicked. Receives the student object for that row as an argument.                                                | -       | Yes      |

## Column Configuration (`columns` array passed to `BaseTable`)

- **Student:** Custom header for sorting by `name`. Custom render shows image, name, email.
- **Roll Number:** Displays `rollNumber`.
- **Hostel:** Custom header for sorting by `hostel`. Custom render shows hostel name in a badge. Hidden on `md` breakpoint and below.
- **Room:** Displays `displayRoom`. Hidden on `sm` breakpoint and below.
- **Actions:** Custom render shows a view details button (`FaEye`) triggering `viewStudentDetails`.

## Usage Example

Often used as part of a larger student management page that handles data fetching, state management for sorting/pagination, and provides the necessary callbacks.

```jsx
import React, { useState, useEffect, useMemo } from "react"
import StudentTableView from "./StudentTableView"
import StudentDetailModal from "./StudentDetailModal"
// ... other imports like pagination, filters, API service ...

function StudentListPage() {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // ... fetch students data useEffect ...

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const fieldA = a[sortField] || ""
      const fieldB = b[sortField] || ""
      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [students, sortField, sortDirection])

  const handleSortChange = (field) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(newDirection)
  }

  const handleViewDetails = (student) => {
    setSelectedStudent(student)
    setIsDetailModalOpen(true)
  }

  // ... render logic with filters, pagination, etc. ...

  return (
    <div className="p-4">
      {/* ... Filters ... */}
      <StudentTableView
        currentStudents={sortedStudents} // Pass sorted (and potentially filtered/paginated) students
        sortField={sortField}
        sortDirection={sortDirection}
        handleSort={handleSortChange}
        viewStudentDetails={handleViewDetails}
      />
      {/* ... Pagination ... */}

      {isDetailModalOpen && selectedStudent && (
        <StudentDetailModal
          selectedStudent={selectedStudent}
          setShowStudentDetail={() => setIsDetailModalOpen(false)}
          // onUpdate={...} // Optional update handler
        />
      )}
    </div>
  )
}
```

## Dependencies

- [`../table/BaseTable`](../table/BaseTable.md): The core table rendering component.
- `react-icons/fa`: Uses `FaSortAmountDown`, `FaSortAmountUp`, `FaEye`, `FaUserGraduate` icons.
