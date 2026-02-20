import { Tabs } from "czero/react"
import { useState, useEffect } from "react"
import { FaCalendarAlt } from "react-icons/fa"
import { SearchInput } from "@/components/ui"
import NoResults from "../../components/common/NoResults"
import EventStats from "../../components/events/EventStats"
import EventCard from "../../components/events/EventCard"
import AddEventModal from "../../components/events/AddEventModal"
import EventsHeader from "../../components/headers/EventsHeader"
import { useAuth } from "../../contexts/AuthProvider"
import { eventsApi } from "../../service"
import { isUpcoming } from "../../utils/dateUtils"
import useAuthz from "../../hooks/useAuthz"

const EVENT_FILTER_TABS = [
  { label: "All Events", value: "all", color: "primary" },
  { label: "Upcoming", value: "upcoming", color: "primary" },
  { label: "Past", value: "past", color: "primary" },
]

const filterEvents = (events, filter, searchTerm) => {
  const now = new Date()

  let filtered = events

  if (filter === "upcoming") {
    filtered = events.filter((event) => isUpcoming(event.dateAndTime))
  } else if (filter === "past") {
    filtered = events.filter((event) => !isUpcoming(event.dateAndTime))
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filtered = filtered.filter((event) => event.eventName.toLowerCase().includes(term) || event.description.toLowerCase().includes(term))
  }

  // Sort events: upcoming by closest date first, past by most recent first
  filtered.sort((a, b) => {
    const dateA = new Date(a.dateAndTime)
    const dateB = new Date(b.dateAndTime)

    if (filter === "upcoming") {
      return dateA - dateB // Closest upcoming events first
    } else if (filter === "past") {
      return dateB - dateA // Most recent past events first
    } else {
      // For "all" tab - upcoming first, then past (most recent first)
      if (isUpcoming(a.dateAndTime) && !isUpcoming(b.dateAndTime)) return -1
      if (!isUpcoming(a.dateAndTime) && isUpcoming(b.dateAndTime)) return 1
      return dateA > dateB ? 1 : -1
    }
  })

  return filtered
}

const EventsPage = () => {
  const { user } = useAuth()
  const { can } = useAuthz()
  const canViewEvents = can("cap.events.view")
  const canManageEvents = ["Admin"].includes(user?.role) && can("cap.events.create")

  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [events, setEvents] = useState([])

  const filteredEvents = filterEvents(events, activeTab, searchTerm)

  const fetchEvents = async () => {
    if (!canViewEvents) return
    try {
      const response = await eventsApi.getAllEvents()
      setEvents(response.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    }
  }

  useEffect(() => {
    if (!canViewEvents) return
    fetchEvents()
  }, [canViewEvents])

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

          <EventStats events={events} />

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto pb-2">
              <Tabs variant="pills" tabs={EVENT_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search events..." className="w-full sm:w-64 md:w-72" />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} refresh={fetchEvents} />
            ))}
          </div>

          {filteredEvents.length === 0 && <NoResults icon={<FaCalendarAlt style={{ color: 'var(--color-text-placeholder)', fontSize: 'var(--font-size-4xl)' }} />} message="No events found" suggestion="Try changing your search or filter criteria" />}
        </div>
      </div>

      {canManageEvents && <AddEventModal show={showAddModal} onClose={() => setShowAddModal(false)} onEventAdded={fetchEvents} />}
    </>
  )
}

export default EventsPage
