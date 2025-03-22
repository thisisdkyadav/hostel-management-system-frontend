import { useState, useEffect } from "react"
import { FaPlus } from "react-icons/fa"
import FilterTabs from "../components/common/FilterTabs"
import SearchBar from "../components/common/SearchBar"
import NoResults from "../components/common/NoResults"
import EventCard from "../components/events/EventCard"
import EventStats from "../components/events/EventStats"
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
      <div className="px-10 py-6 flex-1">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-2xl px-3 font-bold">Events</h1>
          {["Warden"].includes(user?.role) && (
            <div className="flex items-center space-x-6">
              <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-5 py-2 rounded-[12px]">
                <FaPlus className="mr-2" /> Add Event
              </button>
            </div>
          )}
        </header>

        <EventStats events={events} />

        <div className="mt-8 flex justify-between items-center">
          <FilterTabs tabs={EVENT_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search events..." className="w-1/2" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} refresh={fetchEvents} />
          ))}
        </div>

        {filteredEvents.length === 0 && <NoResults />}
      </div>

      {["Warden"].includes(user?.role) && <AddEventModal show={showAddModal} onClose={() => setShowAddModal(false)} onEventAdded={fetchEvents} />}
    </>
  )
}

export default Events
