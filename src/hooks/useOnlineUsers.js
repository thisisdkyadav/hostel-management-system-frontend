import { useState, useEffect } from "react"
import { onlineUsersApi } from "../service"
import { useSocket } from "../contexts/SocketProvider"

/**
 * Custom hook for fetching and managing online users
 * @param {Object} options - Hook options { autoFetch, refreshInterval, role, hostelId }
 * @returns {Object} - { stats, loading, error, refetch }
 */
export const useOnlineUsers = (options = {}) => {
  const { autoFetch = true, refreshInterval = 0, role = null, hostelId = null } = options

  const [stats, setStats] = useState({
    totalOnline: 0,
    byRole: {},
    byHostel: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { isConnected } = useSocket()

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await onlineUsersApi.getOnlineStats()

      if (response.success) {
        setStats(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch online stats")
      }
    } catch (err) {
      console.error("Error fetching online stats:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchStats()
    }

    // Setup refresh interval if specified
    let intervalId
    if (refreshInterval > 0) {
      intervalId = setInterval(fetchStats, refreshInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoFetch, refreshInterval, role, hostelId])

  // Refetch when socket connection status changes
  useEffect(() => {
    if (isConnected && autoFetch) {
      fetchStats()
    }
  }, [isConnected])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}

/**
 * Custom hook for fetching detailed online users list
 * @param {Object} options - Hook options { page, limit, role, hostelId }
 * @returns {Object} - { users, pagination, loading, error, refetch }
 */
export const useOnlineUsersList = (options = {}) => {
  const { page = 1, limit = 50, role = null, hostelId = null } = options

  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { isConnected } = useSocket()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = { page, limit }
      if (role) params.role = role
      if (hostelId) params.hostelId = hostelId

      const response = await onlineUsersApi.getOnlineUsers(params)

      if (response.success) {
        setUsers(response.data)
        setPagination(response.pagination)
      } else {
        throw new Error(response.message || "Failed to fetch online users")
      }
    } catch (err) {
      console.error("Error fetching online users:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, limit, role, hostelId])

  // Refetch when socket connection status changes
  useEffect(() => {
    if (isConnected) {
      fetchUsers()
    }
  }, [isConnected])

  return {
    users,
    pagination,
    loading,
    error,
    refetch: fetchUsers,
  }
}

export default useOnlineUsers
