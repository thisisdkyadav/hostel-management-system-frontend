import { Tabs } from "hzero"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { FaBell } from "react-icons/fa"
import NotificationStats from "../../components/notifications/NotificationStats"
import NotificationTable from "../../components/notifications/NotificationTable"
import NotificationFilterSection from "../../components/notifications/NotificationFilterSection"
import CreateNotificationModal from "../../components/notifications/CreateNotificationModal"
import NoResults from "../../components/common/NoResults"
import { Page, Pagination, Surface, Text } from "@/components/ui"
import NotificationCenterHeader from "../../components/headers/NotificationCenterHeader"
import { notificationApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"
import PageFooter from "../../components/common/PageFooter"

const NOTIFICATION_FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
]

const NotificationCenterPage = () => {
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
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const statusTabs = useMemo(() => {
    const statusCounts = {
      all: stats?.total || 0,
      active: stats?.active || 0,
      expired: stats?.expired || 0,
    }

    return NOTIFICATION_FILTER_TABS.map((tab) => ({
      ...tab,
      count: statusCounts[tab.value] ?? 0,
    }))
  }, [stats])

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

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
      const nextTotalPages = response.meta?.totalPages || 0

      if (nextTotalPages > 0 && filters.page > nextTotalPages) {
        setFilters((prev) => ({ ...prev, page: nextTotalPages }))
        return
      }

      setNotifications(response.data || [])
      setTotalCount(response.meta?.totalCount || 0)
      setTotalPages(Math.max(nextTotalPages, 1))

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
      setNotifications([])
      setTotalCount(0)
      setTotalPages(1)
      console.error(err)
      alert("An error occurred while fetching notifications. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

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
    <Page>
      {error && (
        <Surface bg="danger" color="danger-text" padding={4} radius="lg" accent="danger" style={{ marginBottom: 'var(--spacing-6)' }}>
          <Text weight={500}>Error:</Text>
          <p>{error}</p>
        </Surface>
      )}

      <NotificationCenterHeader showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)}
        onCreateNotification={() => setShowCreateModal(true)}
        userRole={user.role}
      />

      <Surface padding="var(--spacing-6) var(--spacing-8)" className="flex-1 overflow-y-auto">

        {stats && <NotificationStats stats={stats} loading={loading} />}

        {!showFilters && statusTabs.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-6)', marginBottom: 'var(--spacing-4)' }}>
            <Tabs variant="pills" tabs={statusTabs} activeTab={filters.expiryStatus} setActiveTab={(status) => updateFilter("expiryStatus", status)} />
          </div>
        )}

        {showFilters && <NotificationFilterSection filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} />}

        <div style={{ marginTop: 'var(--spacing-6)' }}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative w-16 h-16">
                <Surface border="4px solid var(--color-border-primary)" className="absolute top-0 left-0 w-full h-full rounded-full"></Surface>
                <div
                  className="absolute top-0 left-0 w-full h-full rounded-full animate-spin"
                  style={{
                    border: '4px solid var(--color-primary)',
                    borderTopColor: 'transparent'
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              <NotificationTable notifications={notifications} onRefresh={fetchNotifications} />

              {notifications.length === 0 && (
                <NoResults
                  icon={<FaBell style={{ fontSize: 'var(--font-size-5xl)' }} color="var(--color-text-placeholder)" />}
                  message="No notifications found"
                  suggestion="Try changing your search or filter criteria"
                />
              )}
            </>
          )}
        </div>
      </Surface>

      <PageFooter
        leftContent={[
          <Text as="span" size="sm" color="muted" key="count">
            Showing <Text as="span" weight="semibold">{notifications.length}</Text> of{" "}
            <Text as="span" weight="semibold">{totalCount}</Text> notifications
          </Text>,
        ]}
        rightContent={[
          <Pagination
            key="pagination"
            currentPage={filters.page}
            totalPages={totalPages}
            paginate={paginate}
            compact
            showPageInfo={false}
          />,
        ]}
      />

      <CreateNotificationModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchNotifications} />
    </Page>
  )
}

export default NotificationCenterPage
