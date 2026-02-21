import { Tabs } from "czero/react"
import { useState, useEffect, useCallback } from "react"
import { FaCalendarAlt } from "react-icons/fa"
import { SearchInput, Pagination } from "@/components/ui"
import NoResults from "../../components/common/NoResults"
import EventStats from "../../components/events/EventStats"
import EventCard from "../../components/events/EventCard"
import AddEventModal from "../../components/events/AddEventModal"
import EventsHeader from "../../components/headers/EventsHeader"
import PageFooter from "../../components/common/PageFooter"
import { useAuth } from "../../contexts/AuthProvider"
import { eventsApi } from "../../service"

const EVENT_FILTER_TABS = [
  { label: "All Events", value: "all", color: "primary" },
  { label: "Upcoming", value: "upcoming", color: "primary" },
  { label: "Past", value: "past", color: "primary" },
]

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasMore: false,
}

const EventsPage = () => {
  const { user } = useAuth()
  const canViewEvents = true
  const canManageEvents = ["Admin"].includes(user?.role) && true

  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchEvents = useCallback(async (page = currentPage) => {
    if (!canViewEvents) return

    setLoading(true)
    try {
      const response = await eventsApi.getAllEvents({
        page,
        limit: DEFAULT_PAGINATION.limit,
        filter: activeTab,
        search: searchTerm.trim(),
      })

      const apiPagination = response?.pagination || DEFAULT_PAGINATION
      const totalPages = apiPagination.totalPages || 0

      if (totalPages > 0 && page > totalPages) {
        setCurrentPage(totalPages)
        return
      }

      setEvents(response?.events || [])
      setStats(response?.stats || null)
      setPagination(apiPagination)
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
      setStats(null)
      setPagination(DEFAULT_PAGINATION)
    } finally {
      setLoading(false)
    }
  }, [activeTab, canViewEvents, currentPage, searchTerm])

  useEffect(() => {
    if (!canViewEvents) return
    fetchEvents(currentPage)
  }, [canViewEvents, currentPage, fetchEvents])

  const handleTabChange = (nextTab) => {
    setCurrentPage(1)
    setActiveTab(nextTab)
  }

  const handleSearchChange = (event) => {
    setCurrentPage(1)
    setSearchTerm(event.target.value)
  }

  const handlePaginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  if (!canViewEvents) {
    return (
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger-text)]">
          You do not have permission to view events.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <EventsHeader onAddEvent={() => setShowAddModal(true)} userRole={user?.role} canManageEvents={canManageEvents} />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <EventStats events={events} stats={stats} />

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto pb-2">
              <Tabs variant="pills" tabs={EVENT_FILTER_TABS} activeTab={activeTab} setActiveTab={handleTabChange} />
            </div>
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search events..."
              className="w-full sm:w-64 md:w-72"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} refresh={() => fetchEvents(currentPage)} />
            ))}
          </div>

          {!loading && events.length === 0 && (
            <NoResults
              icon={<FaCalendarAlt style={{ color: "var(--color-text-placeholder)", fontSize: "var(--font-size-4xl)" }} />}
              message="No events found"
              suggestion="Try changing your search or filter criteria"
            />
          )}
        </div>

        <PageFooter
          leftContent={[
            <span key="count" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              Showing <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{events.length}</span> of{" "}
              <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{pagination.total || 0}</span> events
            </span>,
          ]}
          rightContent={[
            <Pagination
              key="pagination"
              currentPage={pagination.page || 1}
              totalPages={Math.max(pagination.totalPages || 0, 1)}
              paginate={handlePaginate}
              compact
              showPageInfo={false}
            />,
          ]}
        />
      </div>

      {canManageEvents && <AddEventModal show={showAddModal} onClose={() => setShowAddModal(false)} onEventAdded={() => fetchEvents(currentPage)} />}
    </>
  )
}

export default EventsPage
