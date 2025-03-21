import { useState, useEffect } from "react"

export const useStudentFilters = (fetchDataCallback) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHostel, setSelectedHostel] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedDegree, setSelectedDegree] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [roomNumber, setRoomNumber] = useState("")
  const [hasAllocation, setHasAllocation] = useState("")
  const [admissionDateFrom, setAdmissionDateFrom] = useState(null)
  const [admissionDateTo, setAdmissionDateTo] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState("rollNumber")
  const [sortDirection, setSortDirection] = useState("asc")

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedHostel("")
    setSelectedUnit("")
    setSelectedYear("")
    setSelectedDepartment("")
    setSelectedDegree("")
    setSelectedGender("")
    setRoomNumber("")
    setHasAllocation("")
    setAdmissionDateFrom(null)
    setAdmissionDateTo(null)
    setCurrentPage(1)
    setSortField("rollNumber")
    setSortDirection("asc")
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const buildQueryParams = () => {
    const params = new URLSearchParams()

    params.append("page", currentPage)
    params.append("limit", 10)

    // Add search term to relevant fields
    if (searchTerm) {
      if (searchTerm.match(/^[a-zA-Z\s]+$/)) {
        params.append("name", searchTerm)
      } else if (searchTerm.includes("@")) {
        params.append("email", searchTerm)
      } else {
        params.append("rollNumber", searchTerm)
      }
    }

    // Add filter parameters
    if (selectedDepartment) params.append("department", selectedDepartment)
    if (selectedDegree) params.append("degree", selectedDegree)
    if (selectedGender) params.append("gender", selectedGender)
    if (selectedHostel) params.append("hostelId", selectedHostel)
    if (selectedUnit) params.append("unitNumber", selectedUnit)
    if (roomNumber) params.append("roomNumber", roomNumber)
    if (selectedYear) params.append("yearOfStudy", selectedYear)
    if (hasAllocation) params.append("hasAllocation", hasAllocation)

    // Add date parameters
    if (admissionDateFrom) {
      // Format date manually without date-fns
      const fromDate = admissionDateFrom
      const fromYear = fromDate.getFullYear()
      const fromMonth = String(fromDate.getMonth() + 1).padStart(2, "0")
      const fromDay = String(fromDate.getDate()).padStart(2, "0")
      params.append("admissionDateFrom", `${fromYear}-${fromMonth}-${fromDay}`)
    }

    if (admissionDateTo) {
      // Format date manually without date-fns
      const toDate = admissionDateTo
      const toYear = toDate.getFullYear()
      const toMonth = String(toDate.getMonth() + 1).padStart(2, "0")
      const toDay = String(toDate.getDate()).padStart(2, "0")
      params.append("admissionDateTo", `${toYear}-${toMonth}-${toDay}`)
    }

    // Add sorting parameters
    params.append("sortBy", sortField)
    params.append("sortOrder", sortDirection)

    return params.toString()
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1)
      fetchDataCallback()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, selectedHostel, selectedUnit, selectedYear, selectedDepartment, selectedDegree, selectedGender, roomNumber, hasAllocation, admissionDateFrom, admissionDateTo])

  return {
    filters: {
      searchTerm,
      setSearchTerm,
      selectedHostel,
      setSelectedHostel,
      selectedUnit,
      setSelectedUnit,
      selectedYear,
      setSelectedYear,
      selectedDepartment,
      setSelectedDepartment,
      selectedDegree,
      setSelectedDegree,
      selectedGender,
      setSelectedGender,
      roomNumber,
      setRoomNumber,
      hasAllocation,
      setHasAllocation,
      admissionDateFrom,
      setAdmissionDateFrom,
      admissionDateTo,
      setAdmissionDateTo,
    },
    pagination: {
      currentPage,
      setCurrentPage,
    },
    sorting: {
      sortField,
      sortDirection,
      handleSort,
    },
    resetFilters,
    buildQueryParams,
  }
}
