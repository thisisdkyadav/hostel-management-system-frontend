import React, { useState } from "react"
import { FaEdit, FaCalendarAlt } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import EventEditForm from "./EventEditForm"
import { eventsApi } from "../../services/apiService"

// Mock API service - replace with actual implementation from Events.jsx
// const eventsApi = {
//   updateEvent: async (id, event) => {
//     // Replace with actual API call
//     return { success: true }
//   },
//   deleteEvent: async (id) => {
//     // Replace with actual API call
//     return { success: true }
//   },
// }

const EventCard = ({ event, refresh }) => {
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
    <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_20px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className={`p-3 mr-4 rounded-xl ${isUpcoming ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"}`}>
            <FaCalendarAlt size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{event.eventName}</h3>
            <span className="text-sm text-gray-600">ID: {event._id.substring(0, 8)}</span>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${isUpcoming ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"}`}>{isUpcoming ? "Upcoming" : "Past"}</span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center">
          <FaCalendarAlt className="text-gray-500 mr-2" />
          <span className="text-sm">{date}</span>
          <BsClock className="text-gray-500 ml-4 mr-2" />
          <span className="text-sm">{time}</span>
        </div>
        <div>
          <p className="text-sm text-gray-700">{event.description}</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button onClick={handleEditClick} className="flex items-center px-5 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-xl hover:bg-[#1360AB] hover:text-white transition-colors">
          <FaEdit className="mr-2" /> Edit
        </button>
      </div>
    </div>
  )
}

export default EventCard
