import { useState, useEffect, useCallback } from "react"
import { useSocket } from "../contexts/SocketProvider"
import { liveCheckInOutApi } from "../services/liveCheckInOutApi"

/**
 * Custom hook for managing live check-in/out data with Socket.IO integration
 */
export const useLiveCheckInOut = (initialFilters = {}) => {
  const socket = useSocket()
  const [entries, setEntries] = useState([])
  const [stats, setStats] = useState({
    total: { checkedIn: 0, checkedOut: 0 },
    today: { checkedIn: 0, checkedOut: 0, crossHostel: 0, sameHostel: 0, total: 0 },
  })
  const [hostelWiseStats, setHostelWiseStats] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [socketStatus, setSocketStatus] = useState(socket?.connected ? "connected" : "disconnected")
  const [lastRealtimeEntryId, setLastRealtimeEntryId] = useState(null)
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    hostelId: "",
    isSameHostel: "",
    search: "",
    page: 1,
    limit: 20,
    sortBy: "dateAndTime",
    sortOrder: "desc",
    ...initialFilters,
  })

  /**
   * Fetch entries from API
   */
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await liveCheckInOutApi.getEntries(filters)

      if (response.success) {
        setEntries(response.data)
        setPagination(response.pagination)
        setStats(response.stats)
      }
    } catch (err) {
      console.error("Error fetching check-in/out entries:", err)
      setError(err.message || "Failed to fetch entries")
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * Fetch hostel-wise statistics
   */
  const fetchHostelWiseStats = useCallback(async () => {
    try {
      const response = await liveCheckInOutApi.getHostelWiseStats()
      if (response.success) {
        setHostelWiseStats(response.data)
      }
    } catch (err) {
      console.error("Error fetching hostel-wise stats:", err)
    }
  }, [])

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Reset to page 1 if filters change
    }))
  }, [])

  /**
   * Reset filters to default
   */
  const resetFilters = useCallback(() => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      hostelId: "",
      isSameHostel: "",
      search: "",
      page: 1,
      limit: 20,
      sortBy: "dateAndTime",
      sortOrder: "desc",
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
    fetchHostelWiseStats()
  }, [fetchEntries, fetchHostelWiseStats])

  // Fetch data when filters change
  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Fetch hostel stats on mount
  useEffect(() => {
    fetchHostelWiseStats()
  }, [fetchHostelWiseStats])

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket) return

    const handleNewEntry = (data) => {
      console.log("📡 New check-in/out entry received:", data)

      // Add new entry to the top of the list
      setEntries((prev) => {
        const newEntries = [data.entry, ...prev]
        // Keep only the current page size
        return newEntries.slice(0, filters.limit)
      })

      setLastRealtimeEntryId(data.entry._id)

      // Update stats
      setStats((prev) => {
        const isToday = new Date(data.entry.dateAndTime).toDateString() === new Date().toDateString()
        const isCheckedIn = data.entry.status === "Checked In"
        const isCheckedOut = data.entry.status === "Checked Out"

        return {
          total: {
            checkedIn: prev.total.checkedIn + (isCheckedIn ? 1 : 0),
            checkedOut: prev.total.checkedOut + (isCheckedOut ? 1 : 0),
          },
          today: {
            checkedIn: prev.today.checkedIn + (isToday && isCheckedIn ? 1 : 0),
            checkedOut: prev.today.checkedOut + (isToday && isCheckedOut ? 1 : 0),
            crossHostel: prev.today.crossHostel + (isToday && !data.entry.isSameHostel ? 1 : 0),
            sameHostel: prev.today.sameHostel + (isToday && data.entry.isSameHostel ? 1 : 0),
            total: prev.today.total + (isToday ? 1 : 0),
          },
        }
      })

      // Update pagination total count
      setPagination((prev) => ({
        ...prev,
        total: prev.total + 1,
        totalPages: Math.ceil((prev.total + 1) / prev.limit),
      }))

      // Refresh hostel-wise stats
      fetchHostelWiseStats()
    }

    socket.on("checkinout:new", handleNewEntry)

    const handleConnect = () => setSocketStatus("connected")
    const handleDisconnect = () => setSocketStatus("disconnected")

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)

    setSocketStatus(socket.connected ? "connected" : "disconnected")

    return () => {
      socket.off("checkinout:new", handleNewEntry)
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
    }
  }, [socket, filters.limit, fetchHostelWiseStats])

  return {
    entries,
    stats,
    hostelWiseStats,
    pagination,
    loading,
    error,
    socketStatus,
    lastRealtimeEntryId,
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  }
}
