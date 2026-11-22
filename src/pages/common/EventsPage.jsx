import { Page, Pagination, SearchInput, Tabs, Text } from "hzero"
import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FaCalendarAlt } from "react-icons/fa"
import NoResults from "../../components/common/NoResults"
import EventStats from "../../components/events/EventStats"
import EventCard from "../../components/events/EventCard"
import AddEventModal from "../../components/events/AddEventModal"
import EventsHeader from "../../components/headers/EventsHeader"
import PageFooter from "../../components/common/PageFooter"
import { useAuth } from "../../contexts/AuthProvider"
import { eventsListQuery } from "./eventsQuery"

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
  const [currentPage, setCurrentPage] = useState(1)

  // Cached so the phone app can preload it and keep it fresh in the background.
  const eventsQuery = useQuery({
    ...eventsListQuery({ page: currentPage, filter: activeTab, search: searchTerm.trim() }),
    placeholderData: keepPreviousData,
    enabled: canViewEvents,
  })
  const response = eventsQuery.isError && !eventsQuery.data ? null : eventsQuery.data
  const events = response?.events || []
  const stats = response?.stats || null
  const pagination = response?.pagination || DEFAULT_PAGINATION
  const loading = eventsQuery.isPending || (eventsQuery.isPlaceholderData && eventsQuery.isFetching)
  const fetchEvents = () => eventsQuery.refetch()

  // Past the last page (an event was removed): step back to the last one.
  if (pagination.totalPages > 0 && currentPage > pagination.totalPages && !eventsQuery.isPlaceholderData) {
    setCurrentPage(pagination.totalPages)
  }

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
      <Page>
        <EventsHeader onAddEvent={() => setShowAddModal(true)} userRole={user?.role} canManageEvents={canManageEvents} />

        <Page.Body>
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
              icon={<FaCalendarAlt style={{ fontSize: "var(--font-size-4xl)" }} color="var(--color-text-placeholder)" />}
              message="No events found"
              suggestion="Try changing your search or filter criteria"
            />
          )}
        </Page.Body>

        <PageFooter
          leftContent={[
            <Text as="span" size="sm" color="muted" key="count">
              Showing <Text as="span" weight="semibold">{events.length}</Text> of{" "}
              <Text as="span" weight="semibold">{pagination.total || 0}</Text> events
            </Text>,
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
      </Page>

      {canManageEvents && <AddEventModal show={showAddModal} onClose={() => setShowAddModal(false)} onEventAdded={() => fetchEvents(currentPage)} />}
    </>
  )
}

export default EventsPage
