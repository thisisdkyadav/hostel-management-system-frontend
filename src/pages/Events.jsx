import { useState, useEffect } from "react"
import { FaPlus, FaCalendarAlt } from "react-icons/fa"
import FilterTabs from "../components/common/FilterTabs"
import SearchBar from "../components/common/SearchBar"
import NoResults from "../components/common/NoResults"
import EventStats from "../components/events/EventStats"
import EventCard from "../components/events/EventCard"
import AddEventModal from "../components/events/AddEventModal"
import { useAuth } from "../contexts/AuthProvider"
import { eventsApi } from "../services/apiService"
import { isUpcoming } from "../utils/dateUtils"

const EVENT_FILTER_TABS = [
  { label: "All Events", value: "all", color: "[#1360AB]" },
  { label: "Upcoming", value: "upcoming", color: "[#1360AB]" },
  { label: "Past", value: "past", color: "[#1360AB]" },
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

const Events = () => {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [events, setEvents] = useState([])

  const filteredEvents = filterEvents(events, activeTab, searchTerm)

  const fetchEvents = async () => {
    try {
      const response = await eventsApi.getAllEvents()
      setEvents(response.events || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <header className="bg-white shadow-sm border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-[#0b57d0] tracking-tight">Events</h1>
                <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              {["Admin"].includes(user?.role) && (
                <button onClick={() => setShowAddModal(true)} className="bg-[#0b57d0] text-white flex items-center px-4 py-2 rounded-full hover:bg-[#0e4eb5] transition-colors text-sm font-medium">
                  <FaPlus className="mr-2" /> Add Event
                </button>
              )}
            </div>
          </div>
        </header>

        <EventStats events={events} />

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto pb-2">
            <FilterTabs tabs={EVENT_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search events..." className="w-full sm:w-64 md:w-72" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} refresh={fetchEvents} />
          ))}
        </div>

        {filteredEvents.length === 0 && <NoResults icon={<FaCalendarAlt className="text-gray-300 text-3xl" />} message="No events found" suggestion="Try changing your search or filter criteria" />}
      </div>

      {["Admin"].includes(user?.role) && <AddEventModal show={showAddModal} onClose={() => setShowAddModal(false)} onEventAdded={fetchEvents} />}
    </>
  )
}

export default Events
