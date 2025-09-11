/**
 * Formats dates for API requests
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted date string in YYYY-MM-DD format
 */
export const formatDateForAPI = (date) => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Builds query parameters for student API requests
 * @param {Object} filters - Filter values
 * @param {Object} pagination - Pagination settings
 * @param {Object} sorting - Sorting settings
 * @returns {string} - URL query parameter string
 */
export const buildStudentQueryParams = (filters, pagination, sorting) => {
  const params = new URLSearchParams()

  // Add pagination parameters
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
  if (filters.status) params.append("status", filters.status)
  if (filters.isDayScholar !== "") {
    const boolValue = filters.isDayScholar === "true" ? true : false
    params.append("isDayScholar", boolValue)
  }

  // Add date parameters
  if (filters.admissionDateFrom) {
    params.append("admissionDateFrom", formatDateForAPI(filters.admissionDateFrom))
  }

  if (filters.admissionDateTo) {
    params.append("admissionDateTo", formatDateForAPI(filters.admissionDateTo))
  }

  // Add missing options filter
  if (filters.missingOptions && filters.missingOptions.length > 0) {
    params.append("missing", filters.missingOptions.join(","))
  }

  // Add sorting parameters
  params.append("sortBy", sorting.sortField)
  params.append("sortOrder", sorting.sortDirection)

  return params.toString()
}

/**
 * Default filter values
 */
export const DEFAULT_FILTERS = {
  searchTerm: "",
  hostelId: "",
  unitNumber: "",
  yearOfStudy: "",
  department: "",
  degree: "",
  gender: "",
  roomNumber: "",
  hasAllocation: "",
  status: "Active",
  isDayScholar: "",
  admissionDateFrom: null,
  admissionDateTo: null,
  missingOptions: [],
}

/**
 * Default sorting values
 */
export const DEFAULT_SORTING = {
  sortField: "rollNumber",
  sortDirection: "asc",
}
