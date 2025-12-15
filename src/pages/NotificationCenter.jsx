import React, { useState, useEffect } from "react"
import { FaBell, FaPlus, FaFilter } from "react-icons/fa"
import NotificationStats from "../components/notifications/NotificationStats"
import NotificationTable from "../components/notifications/NotificationTable"
import NotificationFilterSection from "../components/notifications/NotificationFilterSection"
import CreateNotificationModal from "../components/notifications/CreateNotificationModal"
import NoResults from "../components/common/NoResults"
import Pagination from "../components/common/Pagination"
import FilterTabs from "../components/common/FilterTabs"
import { notificationApi } from "../services/notificationApi"
import { useAuth } from "../contexts/AuthProvider"

const NotificationCenter = () => {
  const { user } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
  })

  const [filters, setFilters] = useState({
    expiryStatus: "all",
    hostelId: "all",
    degree: "all",
    department: "all",
    gender: "all",
    searchTerm: "",
    page: 1,
    limit: 10,
  })
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Status filter tabs configuration
  const statusTabs = [
    { label: `All (${stats.total})`, value: "all", color: "blue-500" },
    { label: `Active (${stats.active})`, value: "active", color: "green-500" },
    { label: `Expired (${stats.expired})`, value: "expired" },
  ]

  const fetchNotifications = async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
      })

      if (filters.expiryStatus !== "all") {
        queryParams.append("expiryStatus", filters.expiryStatus)
      }

      if (filters.hostelId !== "all") {
        queryParams.append("hostelId", filters.hostelId)
      }

      if (filters.degree !== "all") {
        queryParams.append("degree", filters.degree)
      }

      if (filters.department !== "all") {
        queryParams.append("department", filters.department)
      }

      if (filters.gender !== "all") {
        queryParams.append("gender", filters.gender)
      }

      if (filters.searchTerm) {
        queryParams.append("search", filters.searchTerm)
      }

      const response = await notificationApi.getNotifications(queryParams.toString())
      setNotifications(response.data || [])
      setTotalItems(response.meta?.totalCount || 0)
      setTotalPages(response.meta?.totalPages || 1)

      const statsResponse = await notificationApi.getNotificationStats()
      setStats(
        statsResponse.data || {
          total: 0,
          active: 0,
          expired: 0,
        }
      )
    } catch (err) {
      setError("Failed to load notifications")
      console.error(err)
      alert("An error occurred while fetching notifications. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [filters])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      page: key !== "page" ? 1 : prev.page,
      [key]: value,
    }))
  }

  const resetFilters = () => {
    setFilters({
      expiryStatus: "all",
      hostelId: "all",
      degree: "all",
      department: "all",
      gender: "all",
      searchTerm: "",
      page: 1,
      limit: filters.limit,
    })
  }

  const paginate = (pageNumber) => {
    updateFilter("page", pageNumber)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <header className="bg-white shadow-sm border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#1360aa] tracking-tight">Notification Center</h1>
              <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Admin"].includes(user.role) && (
                <>
                  <button className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium" onClick={() => setShowFilters(!showFilters)}>
                    <FaFilter className="mr-2" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </button>
                  <button onClick={() => setShowCreateModal(true)} className="bg-[#1360aa] text-white flex items-center px-4 py-2 rounded-full hover:bg-[#0e4eb5] transition-colors text-sm font-medium">
                    <FaPlus className="mr-2" /> Create Notification
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {stats && <NotificationStats stats={stats} />}

      <div className="mt-6 mb-4">
        <FilterTabs tabs={statusTabs} activeTab={filters.expiryStatus} setActiveTab={(status) => updateFilter("expiryStatus", status)} />
      </div>

      {showFilters && <NotificationFilterSection filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} />}

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <>
            <NotificationTable notifications={notifications} onRefresh={fetchNotifications} />

            {notifications.length === 0 && <NoResults icon={<FaBell className="text-gray-300 text-4xl" />} message="No notifications found" suggestion="Try changing your search or filter criteria" />}

            {totalPages > 1 && <Pagination currentPage={filters.page} totalPages={totalPages} paginate={paginate} />}
          </>
        )}
      </div>

      <CreateNotificationModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchNotifications} />
    </div>
  )
}

export default NotificationCenter
