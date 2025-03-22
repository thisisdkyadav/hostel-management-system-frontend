import { useState, useEffect, useCallback, useRef } from "react"
import { studentApi } from "../services/apiService"
import { buildStudentQueryParams, DEFAULT_FILTERS, DEFAULT_SORTING } from "../utils/studentUtils"

export const useStudents = (options = {}) => {
  const { autoFetch = true, perPage = 10, initialFilters = {}, debounceMs = 500 } = options

  // Students data state
  const [students, setStudents] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Filter states
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  })

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: initialFilters.page || 1,
    perPage: initialFilters.limit || perPage,
  })

  // Sorting state
  const [sorting, setSorting] = useState({
    ...DEFAULT_SORTING,
    ...(initialFilters.sortField && { sortField: initialFilters.sortField }),
    ...(initialFilters.sortDirection && { sortDirection: initialFilters.sortDirection }),
  })

  // Store timeout ID for debouncing
  const debounceTimerRef = useRef(null)

  // Fetch students from API
  const fetchStudents = useCallback(async (queryString) => {
    try {
      setLoading(true)
      setError(null)
      const response = await studentApi.getStudents(queryString)
      setStudents(response?.data || [])
      setTotalCount(response?.meta?.total || 0)
      return response
    } catch (err) {
      setError(err.message || "Failed to fetch students")
      return { error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  // Build query params and trigger fetch
  const fetchWithCurrentFilters = useCallback(() => {
    const queryString = buildStudentQueryParams(filters, pagination, sorting)
    return fetchStudents(queryString)
  }, [fetchStudents, filters, pagination, sorting])

  // Fetch with custom params (bypassing filters)
  const fetchWithParams = useCallback(
    (customParams) => {
      return fetchStudents(customParams)
    },
    [fetchStudents]
  )

  // Update a single filter value
  const updateFilter = useCallback(
    (key, value) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
      // Reset to page 1 when filters change
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }))

      // Debounce API call
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (autoFetch) {
        debounceTimerRef.current = setTimeout(() => {
          fetchWithCurrentFilters()
        }, debounceMs)
      }
    },
    [autoFetch, debounceMs, fetchWithCurrentFilters]
  )

  // Set current page
  const setCurrentPage = useCallback(
    (page) => {
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
      }))

      if (autoFetch) {
        // Don't debounce page changes - execute immediately
        fetchWithCurrentFilters()
      }
    },
    [autoFetch, fetchWithCurrentFilters]
  )

  // Handle sorting
  const handleSort = useCallback(
    (field) => {
      setSorting((prev) => ({
        sortField: field,
        sortDirection: prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc",
      }))

      if (autoFetch) {
        // Don't debounce sort changes - execute immediately
        fetchWithCurrentFilters()
      }
    },
    [autoFetch, fetchWithCurrentFilters]
  )

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
    setSorting(DEFAULT_SORTING)

    if (autoFetch) {
      fetchWithCurrentFilters()
    }
  }, [autoFetch, fetchWithCurrentFilters])

  // Import students and refresh data
  const importStudents = useCallback(
    async (importedStudents) => {
      try {
        setLoading(true)
        const response = await studentApi.importStudents(importedStudents)
        if (response?.error) {
          throw new Error(response.error.message)
        }
        fetchWithCurrentFilters()
        return { success: true }
      } catch (err) {
        setError(err.message || "Failed to import students")
        return { error: err }
      } finally {
        setLoading(false)
      }
    },
    [fetchWithCurrentFilters]
  )

  // Initial fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchWithCurrentFilters()
    }

    // Cleanup debounce timers on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [autoFetch, fetchWithCurrentFilters])

  // Build query params without triggering a fetch
  const buildQueryParams = useCallback(() => {
    return buildStudentQueryParams(filters, pagination, sorting)
  }, [filters, pagination, sorting])

  return {
    // Data
    students,
    totalCount,
    loading,
    error,

    // Filter state
    filters,
    pagination,
    sorting,

    // Actions
    updateFilter,
    setCurrentPage,
    handleSort,
    resetFilters,

    // API methods
    refreshStudents: fetchWithCurrentFilters,
    fetchWithParams,
    buildQueryParams,
    importStudents,
  }
}
