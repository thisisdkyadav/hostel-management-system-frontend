import { useState, useEffect, useCallback, useRef } from "react"
import { studentApi } from "../service"
import { buildStudentQueryParams, DEFAULT_FILTERS, DEFAULT_SORTING } from "../utils/studentUtils"

export const useStudents = (options = {}) => {
  const { autoFetch = true, perPage = 10, initialFilters = {}, debounceMs = 500 } = options

  const [students, setStudents] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
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

  const fetchStudents = useCallback(
    async (queryString) => {
      try {
        setLoading(true)
        setError(null)
        const response = await studentApi.getStudents(queryString)
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
    const queryString = buildStudentQueryParams(filters, pagination, sorting)
    return fetchStudents(queryString)
  }, [fetchStudents, filters, pagination, sorting])

  const fetchWithParams = useCallback(
    (customParams) => {
      return fetchStudents(customParams)
    },
    [fetchStudents]
  )

  const updateFilter = useCallback(
    (key, value) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }))

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

  const setCurrentPage = useCallback(
    (page) => {
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
      }))

      if (autoFetch) {
        fetchWithCurrentFilters()
      }
    },
    [autoFetch, fetchWithCurrentFilters]
  )

  const setPageSize = useCallback(
    (size) => {
      setPagination((prev) => ({
        ...prev,
        perPage: size,
        currentPage: 1,
      }))

      if (autoFetch) {
        fetchWithCurrentFilters()
      }
    },
    [autoFetch, fetchWithCurrentFilters]
  )

  const handleSort = useCallback(
    (field) => {
      setSorting((prev) => ({
        sortField: field,
        sortDirection: prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc",
      }))

      if (autoFetch) {
        fetchWithCurrentFilters()
      }
    },
    [autoFetch, fetchWithCurrentFilters]
  )

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

  useEffect(() => {
    if (autoFetch) {
      fetchWithCurrentFilters()
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [autoFetch, fetchWithCurrentFilters])

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
