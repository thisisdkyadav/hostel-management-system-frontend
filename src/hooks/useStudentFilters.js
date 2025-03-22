import { useState, useCallback, useEffect } from "react"

export const useStudentFilters = (onFilterChange, initialFilters = {}) => {
  // Initialize all filter states with initial values or defaults
  const [filters, setFilters] = useState({
    searchTerm: initialFilters.searchTerm || "",
    hostelId: initialFilters.hostelId || "",
    unitNumber: initialFilters.unitNumber || "",
    yearOfStudy: initialFilters.yearOfStudy || "",
    department: initialFilters.department || "",
    degree: initialFilters.degree || "",
    gender: initialFilters.gender || "",
    roomNumber: initialFilters.roomNumber || "",
    hasAllocation: initialFilters.hasAllocation || "",
    admissionDateFrom: initialFilters.admissionDateFrom || null,
    admissionDateTo: initialFilters.admissionDateTo || null,
  })

  const [pagination, setPagination] = useState({
    currentPage: initialFilters.page || 1,
    perPage: initialFilters.limit || 10,
  })

  const [sorting, setSorting] = useState({
    sortField: initialFilters.sortField || "rollNumber",
    sortDirection: initialFilters.sortDirection || "asc",
  })

  // Update individual filter
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    // Reset to page 1 when filters change
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
  }, [])

  // Change page without resetting filters
  const setCurrentPage = useCallback((page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }))
  }, [])

  // Handle sort logic
  const handleSort = useCallback((field) => {
    setSorting((prev) => ({
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc",
    }))
  }, [])

  // Reset all filters to default values
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      hostelId: "",
      unitNumber: "",
      yearOfStudy: "",
      department: "",
      degree: "",
      gender: "",
      roomNumber: "",
      hasAllocation: "",
      admissionDateFrom: null,
      admissionDateTo: null,
    })
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
    setSorting({
      sortField: "rollNumber",
      sortDirection: "asc",
    })
  }, [])

  // Build query params from current state
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()

    params.append("page", pagination.currentPage)
    params.append("limit", pagination.perPage)

    // Handle search term logic
    if (filters.searchTerm) {
      if (filters.searchTerm.match(/^[a-zA-Z\s]+$/)) {
        params.append("name", filters.searchTerm)
      } else if (filters.searchTerm.includes("@")) {
        params.append("email", filters.searchTerm)
      } else {
        params.append("rollNumber", filters.searchTerm)
      }
    }

    // Add filter parameters
    if (filters.department) params.append("department", filters.department)
    if (filters.degree) params.append("degree", filters.degree)
    if (filters.gender) params.append("gender", filters.gender)
    if (filters.hostelId) params.append("hostelId", filters.hostelId)
    if (filters.unitNumber) params.append("unitNumber", filters.unitNumber)
    if (filters.roomNumber) params.append("roomNumber", filters.roomNumber)
    if (filters.yearOfStudy) params.append("yearOfStudy", filters.yearOfStudy)
    if (filters.hasAllocation) params.append("hasAllocation", filters.hasAllocation)

    // Add date parameters
    if (filters.admissionDateFrom) {
      const fromDate = filters.admissionDateFrom
      const fromYear = fromDate.getFullYear()
      const fromMonth = String(fromDate.getMonth() + 1).padStart(2, "0")
      const fromDay = String(fromDate.getDate()).padStart(2, "0")
      params.append("admissionDateFrom", `${fromYear}-${fromMonth}-${fromDay}`)
    }

    if (filters.admissionDateTo) {
      const toDate = filters.admissionDateTo
      const toYear = toDate.getFullYear()
      const toMonth = String(toDate.getMonth() + 1).padStart(2, "0")
      const toDay = String(toDate.getDate()).padStart(2, "0")
      params.append("admissionDateTo", `${toYear}-${toMonth}-${toDay}`)
    }

    // Add sorting parameters
    params.append("sortBy", sorting.sortField)
    params.append("sortOrder", sorting.sortDirection)

    return params.toString()
  }, [filters, pagination, sorting])

  // Set up debounced filter callback
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (onFilterChange) onFilterChange()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [filters, sorting, pagination.currentPage, onFilterChange])

  return {
    filters,
    updateFilter,
    pagination,
    setCurrentPage,
    sorting,
    handleSort,
    resetFilters,
    buildQueryParams,
  }
}
