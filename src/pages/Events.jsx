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

const EVENT_FILTER_TABS = [
  { id: "all", label: "All Events" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
]

const filterEvents = (events, filter, searchTerm) => {
  const now = new Date()

  let filtered = events

  if (filter === "upcoming") {
    filtered = events.filter((event) => new Date(event.dateAndTime) > now)
  } else if (filter === "past") {
    filtered = events.filter((event) => new Date(event.dateAndTime) < now)
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filtered = filtered.filter((event) => event.eventName.toLowerCase().includes(term) || event.description.toLowerCase().includes(term))
  }

  return filtered
}

const Events = () => {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState("all")
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
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Events</h1>
          {["Warden"].includes(user?.role) && (
            <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
              <FaPlus className="mr-2" /> Add Event
            </button>
          )}
        </header>

        <EventStats events={events} />

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto overflow-x-auto pb-2">
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

      {["Warden"].includes(user?.role) && <AddEventModal show={showAddModal} onClose={() => setShowAddModal(false)} onEventAdded={fetchEvents} />}
    </>
  )
}

export default Events
