import React, { useState } from "react"
import { FaEdit, FaCalendarAlt } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import EventEditForm from "./EventEditForm"
import { eventsApi } from "../../services/apiService"
import { useAuth } from "../../contexts/AuthProvider"

const EventCard = ({ event, refresh }) => {
  const { user } = useAuth()

  const [isEditing, setIsEditing] = useState(false)

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString)
    return {
      date: dateTime.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      time: dateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const isUpcoming = new Date(event.dateAndTime) > new Date()
  const { date, time } = formatDateTime(event.dateAndTime)

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async (updatedEvent) => {
    try {
      const response = await eventsApi.updateEvent(updatedEvent._id, updatedEvent)
      if (response.success) {
        alert("Event updated successfully")
        setIsEditing(false)
        refresh()
      } else {
        alert("Failed to update event")
      }
    } catch (error) {
      alert("An error occurred while updating the event")
    }
  }

  const handleDelete = async (eventId) => {
    try {
      const response = await eventsApi.deleteEvent(eventId)
      if (response.success) {
        alert("Event deleted successfully")
        refresh()
      } else {
        alert("Failed to delete event")
      }
    } catch (error) {
      alert("An error occurred while deleting the event")
    }
  }

  if (isEditing) {
    return <EventEditForm event={event} onCancel={handleCancelEdit} onSave={handleSaveEdit} onDelete={handleDelete} />
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className={`p-2.5 mr-3 rounded-xl ${isUpcoming ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"}`}>
            <FaCalendarAlt size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base md:text-lg line-clamp-1">{event.eventName}</h3>
            <span className="text-xs text-gray-500">ID: {event._id.substring(0, 8)}</span>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full ${isUpcoming ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"}`}>{isUpcoming ? "Upcoming" : "Past"}</span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center flex-wrap">
          <div className="flex items-center mr-4 mb-1">
            <FaCalendarAlt className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{date}</span>
          </div>
          <div className="flex items-center">
            <BsClock className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{time}</span>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg min-h-[80px]">
          <p className="text-sm text-gray-700 line-clamp-3">{event.description}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
        {["Admin", "Warden", "Associate Warden", "Security"].includes(user.role) && (
          <button onClick={handleEditClick} className="flex items-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300">
            <FaEdit className="mr-2" /> Edit
          </button>
        )}
      </div>
    </div>
  )
}

export default EventCard
