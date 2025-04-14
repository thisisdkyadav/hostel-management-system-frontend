# StudentStats Component (`/src/components/common/students/StudentStats.jsx`)

Calculates and displays key statistics about a list of students using `StatCards`.

## Purpose and Functionality

This component takes an array of student objects and renders a set of statistic cards summarizing the data. Specifically, it calculates and displays:

- Total number of students.
- Number of male students and their percentage of the total.
- Number of female students and their percentage of the total.

It uses the common `StatCards` component to present these statistics in a visually consistent manner.

## Props

| Prop       | Type    | Description                                                                                                               | Default | Required |
| :--------- | :------ | :------------------------------------------------------------------------------------------------------------------------ | :------ | :------- |
| `students` | `array` | An array of student objects. Each object must have a `gender` property (`'Male'`, `'Female'`, or other) for calculations. | -       | Yes      |

## Calculation Logic

- Counts the total length of the `students` array.
- Filters the array to count students where `gender === 'Male'`.
- Filters the array to count students where `gender === 'Female'`.
- Calculates percentages based on these counts.
- Constructs the `statsData` array required by the `StatCards` component.

## Usage Example

```jsx
import React, { useState, useEffect } from "react"
import StudentStats from "./StudentStats"
import { studentApi } from "../../services/apiService" // Example API

function StudentDashboard() {
  const [allStudents, setAllStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        // Assume API fetches all students without pagination for stats
        const response = await studentApi.getStudents({ limit: 0 })
        setAllStudents(response.data || [])
      } catch (error) {
        console.error("Error fetching all students for stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (isLoading) {
    return <div>Loading stats...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Student Statistics</h2>
      <StudentStats students={allStudents} />
      {/* ... Rest of the dashboard/page ... */}
    </div>
  )
}
```

## Dependencies

- [`../common/StatCards`](../StatCards.md): The component used to render the calculated statistics.
- `react-icons/fa`: Uses `FaUsers`.
- `react-icons/bs`: Uses `BsGenderMale`, `BsGenderFemale`.
- `react-icons/io`: Imports `IoMdSchool` (currently commented out in source).
