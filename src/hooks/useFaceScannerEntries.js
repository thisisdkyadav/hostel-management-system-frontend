import { useState, useEffect, useCallback } from "react"
import { useSocket } from "../contexts/SocketProvider"
import { securityApi } from "../service"

/**
 * Custom hook for managing face scanner gate entries with Socket.IO integration
 * Used by hostel gate users to view real-time face scanner entries
 */
export const useFaceScannerEntries = (initialFilters = {}) => {
  const { socket, isConnected } = useSocket()
  const [entries, setEntries] = useState([])
  const [pendingCrossHostelEntries, setPendingCrossHostelEntries] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastRealtimeEntryId, setLastRealtimeEntryId] = useState(null)
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 20,
    ...initialFilters,
  })

  /**
   * Fetch entries from API
   */
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await securityApi.getFaceScannerEntries(filters)

      if (response.success) {
        setEntries(response.entries)
        setPendingCrossHostelEntries(response.pendingCrossHostelEntries || [])
        setPagination(response.pagination)
      }
    } catch (err) {
      console.error("Error fetching face scanner entries:", err)
      setError(err.message || "Failed to fetch entries")
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }))
  }, [])

  /**
   * Reset filters to default
   */
  const resetFilters = useCallback(() => {
    setFilters({
      status: "",
      page: 1,
      limit: 20,
    })
  }, [])

  /**
   * Handle pagination
   */
  const goToPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const nextPage = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, pagination.totalPages),
    }))
  }, [pagination.totalPages])

  const prevPage = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }))
  }, [])

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    fetchEntries()
  }, [fetchEntries])

  /**
   * Update cross-hostel reason for an entry
   */
  const updateCrossHostelReason = useCallback(async (entryId, reason) => {
    try {
      await securityApi.updateCrossHostelReason(entryId, reason)
      // Refresh entries to update the list
      await fetchEntries()
      return { success: true }
    } catch (err) {
      console.error("Error updating cross-hostel reason:", err)
      throw err
    }
  }, [fetchEntries])

  // Fetch data when filters change
  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Socket.IO real-time updates - listen for gateentry:new events
  useEffect(() => {
    if (!socket) return

    const handleNewEntry = (data) => {
      console.log("📡 New gate entry received:", data)

      // Add new entry to the top of the list
      setEntries((prev) => {
        // Check if entry already exists
        const exists = prev.some((e) => e._id === data.entry._id)
        if (exists) return prev

        const newEntries = [data.entry, ...prev]
        // Keep only the current page size
        return newEntries.slice(0, filters.limit)
      })

      setLastRealtimeEntryId(data.entry._id)

      // Check if it's a pending cross-hostel entry
      if (data.entry.isSameHostel === false && !data.entry.reason && data.entry.status === "Checked In") {
        setPendingCrossHostelEntries((prev) => {
          const exists = prev.some((e) => e._id === data.entry._id)
          if (exists) return prev
          return [data.entry, ...prev]
        })
      }

      // Update pagination total count
      setPagination((prev) => ({
        ...prev,
        total: prev.total + 1,
        totalPages: Math.ceil((prev.total + 1) / prev.limit),
      }))
    }

    // Listen for gate entry events (emitted to hostel room)
    socket.on("gateentry:new", handleNewEntry)

    return () => {
      socket.off("gateentry:new", handleNewEntry)
    }
  }, [socket, filters.limit])

  return {
    entries,
    pendingCrossHostelEntries,
    pagination,
    loading,
    error,
    isConnected,
    lastRealtimeEntryId,
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    updateCrossHostelReason,
  }
}

export default useFaceScannerEntries
