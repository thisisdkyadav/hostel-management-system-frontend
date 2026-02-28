import { useState, useEffect, useCallback, useRef } from "react"
import { studentApi } from "../service"
import { buildStudentQueryParams, DEFAULT_FILTERS, DEFAULT_SORTING } from "../utils/studentUtils"

export const useStudents = (options = {}) => {
  const { autoFetch = true, perPage = 10, initialFilters = {}, debounceMs = 500 } = options

  const [students, setStudents] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(Boolean(autoFetch))
  const [error, setError] = useState(null)
  const [missingOptions, setMissingOptions] = useState([])

  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    status: "Active",
    ...initialFilters,
  })

  const [pagination, setPagination] = useState({
    currentPage: initialFilters.page || 1,
    perPage: initialFilters.limit || perPage,
  })
  const [totalPages, setTotalPages] = useState(0)

  const [sorting, setSorting] = useState({
    ...DEFAULT_SORTING,
    ...(initialFilters.sortField && { sortField: initialFilters.sortField }),
    ...(initialFilters.sortDirection && { sortDirection: initialFilters.sortDirection }),
  })

  const debounceTimerRef = useRef(null)
  const isInitialMount = useRef(true)
  const shouldDebounce = useRef(false)

  const fetchStudents = useCallback(
    async (params) => {
      try {
        setLoading(true)
        setError(null)
        const response = await studentApi.getStudents(params)
        setStudents(response?.data || [])
        setTotalCount(response?.pagination?.total || 0)
        setTotalPages(Math.ceil(response?.pagination?.total / pagination.perPage) || 0)

        // Handle missing options from API response
        if (response?.meta?.missingOptions) {
          setMissingOptions(response.meta.missingOptions)
        }

        return response
      } catch (err) {
        setError(err.message || "Failed to fetch students")
        return { error: err }
      } finally {
        setLoading(false)
      }
    },
    [pagination.perPage]
  )

  const fetchWithCurrentFilters = useCallback(() => {
    const params = buildStudentQueryParams(filters, pagination, sorting)
    return fetchStudents(params)
  }, [fetchStudents, filters, pagination, sorting])

  const fetchWithParams = useCallback(
    (customParams) => {
      return fetchStudents(customParams)
    },
    [fetchStudents]
  )

  const updateFilter = useCallback(
    (key, value) => {
      // Mark that we should debounce (for text input filters)
      shouldDebounce.current = key === "searchTerm"
      
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }))
    },
    []
  )

  const setCurrentPage = useCallback(
    (page) => {
      shouldDebounce.current = false
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
      }))
    },
    []
  )

  const setPageSize = useCallback(
    (size) => {
      shouldDebounce.current = false
      setPagination((prev) => ({
        ...prev,
        perPage: size,
        currentPage: 1,
      }))
    },
    []
  )

  const handleSort = useCallback(
    (field) => {
      shouldDebounce.current = false
      setSorting((prev) => ({
        sortField: field,
        sortDirection: prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc",
      }))
    },
    []
  )

  const resetFilters = useCallback(() => {
    shouldDebounce.current = false
    setFilters(DEFAULT_FILTERS)
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
    setSorting(DEFAULT_SORTING)
  }, [])

  const importStudents = useCallback(
    async (importedStudents, options = {}) => {
      try {
        setLoading(true)
        const response = await studentApi.importStudents(importedStudents, options)
        const results = Array.isArray(response?.results)
          ? response.results
          : (response?.results ? [response.results] : [])
        const errors = Array.isArray(response?.errors) ? response.errors : []

        fetchWithCurrentFilters()
        return {
          success: true,
          data: {
            total: Array.isArray(importedStudents) ? importedStudents.length : 1,
            successCount: results.length,
            errorCount: errors.length,
            results,
            errors,
          },
        }
      } catch (err) {
        setError(err.message || "Failed to import students")
        return {
          success: false,
          error: err,
          data: {
            total: Array.isArray(importedStudents) ? importedStudents.length : 1,
            successCount: 0,
            errorCount: Array.isArray(importedStudents) ? importedStudents.length : 1,
            results: [],
            errors: [],
          },
        }
      } finally {
        setLoading(false)
      }
    },
    [fetchWithCurrentFilters]
  )

  // Effect to fetch students when filters, pagination, or sorting changes
  useEffect(() => {
    if (!autoFetch) return

    // Skip initial mount (will be handled by the initial fetch effect)
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Use debouncing for search term, immediate fetch for other filters
    if (shouldDebounce.current) {
      debounceTimerRef.current = setTimeout(() => {
        const params = buildStudentQueryParams(filters, pagination, sorting)
        fetchStudents(params)
      }, debounceMs)
    } else {
      const params = buildStudentQueryParams(filters, pagination, sorting)
      fetchStudents(params)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [autoFetch, filters, pagination, sorting, debounceMs, fetchStudents])

  // Initial fetch on mount
  useEffect(() => {
    if (autoFetch) {
      const params = buildStudentQueryParams(filters, pagination, sorting)
      fetchStudents(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const buildQueryParams = useCallback(() => {
    return buildStudentQueryParams(filters, pagination, sorting)
  }, [filters, pagination, sorting])

  return {
    students,
    totalCount,
    loading,
    error,
    missingOptions,

    filters,
    pagination,
    totalPages,
    sorting,

    setPageSize,
    updateFilter,
    setCurrentPage,
    handleSort,
    resetFilters,

    refreshStudents: fetchWithCurrentFilters,
    fetchWithParams,
    buildQueryParams,
    importStudents,
  }
}
