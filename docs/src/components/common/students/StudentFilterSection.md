# StudentFilterSection Component (`/src/components/common/students/StudentFilterSection.jsx`)

A component providing a set of filters for refining a list of students.

## Purpose and Functionality

This component renders a dedicated section (typically displayed above a student list or table) containing various controls to filter students based on different criteria. It includes:

- A general search input (for name, roll number, email).
- Dropdowns/Inputs for filtering by:
  - Hostel (using `hostels` prop for options)
  - Unit Number (text input)
  - Room Number (text input)
  - Department (text input)
  - Degree (using `degrees` prop for options)
  - Gender
  - Allocation Status (Allocated/Not Allocated)
- Date range pickers (`SimpleDatePicker`) for Admission Date.
- A dropdown to control the number of students displayed per page (`setPageSize`).
- A "Reset Filters" button.
- Communicates filter changes upwards using the `updateFilter` prop.

## Props

| Prop           | Type     | Description                                                                                                                                                                                                                                                          | Default | Required |
| :------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------- |
| `filters`      | `object` | An object containing the current values of all filters (e.g., `{ searchTerm: '', hostelId: '', unitNumber: '', roomNumber: '', department: '', degree: '', gender: '', hasAllocation: '', admissionDateFrom: null, admissionDateTo: null, studentsPerPage: '10' }`). | -       | Yes      |
| `updateFilter` | `func`   | Callback function invoked when any filter value changes. Receives the filter key (string) and the new value as arguments.                                                                                                                                            | -       | Yes      |
| `resetFilters` | `func`   | Callback function invoked when the "Reset Filters" button is clicked. Should reset the `filters` state in the parent component.                                                                                                                                      | -       | Yes      |
| `hostels`      | `array`  | An array of hostel objects (or strings) used to populate the Hostel dropdown. Each object should have `_id` (or `id`) and `name`.                                                                                                                                    | -       | Yes      |
| `degrees`      | `array`  | An array of degree strings used to populate the Degree dropdown.                                                                                                                                                                                                     | -       | Yes      |
| `setPageSize`  | `func`   | Callback function invoked when the "Students per page" dropdown changes. Receives the new page size value (string) as an argument.                                                                                                                                   | -       | Yes      |

## Filter Fields

- `searchTerm`: General text search.
- `hostelId`: ID of the selected hostel.
- `unitNumber`: Text input for unit number.
- `roomNumber`: Text input for room number.
- `department`: Text input for department.
- `degree`: Selected degree string.
- `gender`: Selected gender string ('Male', 'Female', 'Other').
- `hasAllocation`: String representation of boolean ('true', 'false', or '').
- `admissionDateFrom`: Start date (Date object or null).
- `admissionDateTo`: End date (Date object or null).
- `studentsPerPage`: Selected page size string ('10', '20', etc.).

## Usage Example

Used within a parent component that manages the student list, filter state, and data fetching.

```jsx
import React, { useState, useEffect, useCallback } from "react"
import StudentFilterSection from "./StudentFilterSection"
import StudentTableView from "./StudentTableView" // Or StudentCard view
import Pagination from "../common/Pagination"
import { studentApi, hostelApi } from "../../services/apiService" // Example API

const INITIAL_FILTERS = {
  searchTerm: "",
  hostelId: "",
  unitNumber: "",
  roomNumber: "",
  department: "",
  degree: "",
  gender: "",
  hasAllocation: "",
  admissionDateFrom: null,
  admissionDateTo: null,
  studentsPerPage: "10",
}

function FilterableStudentList() {
  const [students, setStudents] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hostelOptions, setHostelOptions] = useState([])
  const [degreeOptions, setDegreeOptions] = useState([]) // Assume fetched or static
  // ... other states like loading, sorting ...

  // Fetch hostels and degrees on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const hostelRes = await hostelApi.getHostels() // Example call
        setHostelOptions(hostelRes.hostels || [])
        // Fetch or set degrees
        setDegreeOptions(["B.Tech", "M.Tech", "PhD"])
      } catch (error) {
        console.error("Error fetching filter options:", error)
      }
    }
    fetchOptions()
  }, [])

  // Fetch students when filters or page change
  const fetchStudents = useCallback(async () => {
    // ... setLoading(true) ...
    try {
      const params = {
        ...filters,
        page: currentPage,
        limit: parseInt(filters.studentsPerPage, 10),
        admissionDateFrom: filters.admissionDateFrom?.toISOString(),
        admissionDateTo: filters.admissionDateTo?.toISOString(),
        // ... add sort params ...
      }
      const response = await studentApi.getStudents(params) // Example API call
      setStudents(response.data || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      // ... setLoading(false) ...
    }
  }, [filters, currentPage])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (size) => {
    handleFilterChange("studentsPerPage", size)
  }

  return (
    <div className="p-4 space-y-6">
      <StudentFilterSection filters={filters} updateFilter={handleFilterChange} resetFilters={handleResetFilters} hostels={hostelOptions} degrees={degreeOptions} setPageSize={handlePageSizeChange} />
      {/* ... Loading/Error State ... */}
      <StudentTableView
        currentStudents={students}
        // ... sort props ...
        // ... view details props ...
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} paginate={setCurrentPage} />
    </div>
  )
}
```

## Dependencies

- `../common/SimpleDatePicker`: Used for date range inputs.
- `react-icons/bs`: Uses `BsFilterRight`.
- `react-icons/md`: Uses `MdClearAll`.
- `react-icons/fa`: Uses `FaSearch`.
