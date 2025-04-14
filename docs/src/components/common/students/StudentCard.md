# StudentCard Component (`/src/components/common/students/StudentCard.jsx`)

A component that displays summary information about a student in a card format.

## Purpose and Functionality

Provides an alternative view to the table row for displaying student information, often used in grid layouts or responsive designs. It renders a styled card containing:

- Profile image (or a default icon if none provided).
- Student's name and email.
- Roll number.
- Hostel name and room number (using `displayRoom`).
- Department and year (if available).
- A view details button (`FaEye`) at the bottom.

## Props

| Prop      | Type     | Description                                                                                                                                                         | Default | Required |
| :-------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------ | :------- |
| `student` | `object` | The student object containing data to display (e.g., `name`, `email`, `profileImage`, `rollNumber`, `hostel`, `displayRoom`, `department`, `year`).                 | -       | Yes      |
| `onClick` | `func`   | Callback function invoked when the card itself or the view details button is clicked. Typically used to open the `StudentDetailModal` or navigate to a detail page. | -       | Yes      |

## Display Logic

- Shows the `student.profileImage` if available, otherwise a default school icon (`IoMdSchool`).
- Displays `student.hostel` or "N/A".
- Displays `student.displayRoom` or "Room not allocated".
- Only shows the Department/Year row if `student.department` is present.
- The entire card is clickable, triggering the `onClick` prop.
- The view details button also triggers `onClick` but stops event propagation to prevent potential double triggers if nested.

## Usage Example

Used to render students in a grid layout.

```jsx
import React, { useState } from "react"
import StudentCard from "./StudentCard"
import StudentDetailModal from "./StudentDetailModal"

function StudentGrid({ students }) {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleCardClick = (student) => {
    setSelectedStudent(student)
    setIsDetailModalOpen(true)
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {students.map((student) => (
          <StudentCard
            key={student._id || student.rollNumber} // Use a unique key
            student={student}
            onClick={() => handleCardClick(student)}
          />
        ))}
      </div>

      {isDetailModalOpen && selectedStudent && <StudentDetailModal selectedStudent={selectedStudent} setShowStudentDetail={() => setIsDetailModalOpen(false)} />}
    </div>
  )
}
```

## Dependencies

- `react-icons/io`: Uses `IoMdSchool`.
- `react-icons/fa`: Uses `FaBuilding`, `FaEnvelope`, `FaIdCard`, `FaEye`.
