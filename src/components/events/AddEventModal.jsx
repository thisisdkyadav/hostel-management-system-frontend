import React, { useState } from "react"
import { eventsApi } from "../../services/apiService"
import { useWarden } from "../../contexts/WardenProvider"

const AddEventModal = ({ show, onClose, onEventAdded }) => {
  const { profile } = useWarden()

  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    dateAndTime: new Date().toISOString().slice(0, 16),
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(profile?.hostelId._id, "hostelId")

    const { eventName, description, dateAndTime } = formData
    if (!eventName || !description || !dateAndTime) {
      alert("Please fill in all fields.")
      return
    }
    if (!profile?.hostelId._id) {
      alert("Hostel ID is required.")
      return
    }

    const eventData = { ...formData, hostelId: profile?.hostelId._id }

    try {
      const newEvent = await eventsApi.addEvent(eventData)
      if (!newEvent) {
        alert("Failed to add event. Please try again.")
        return
      }
      alert(`Event "${newEvent.eventName}" added successfully!`)
      onEventAdded && onEventAdded()
      onClose()
    } catch (error) {
      console.error("Error adding event:", error)
      alert("Failed to add event. Please try again.")
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[20px] w-[600px] max-w-[95%] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-5">Add New Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Event Name</label>
            <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Enter event name" required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full p-2 border border-gray-300 rounded-lg resize-none" placeholder="Describe the event, location, activities, etc." required></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Date and Time</label>
            <input type="datetime-local" name="dateAndTime" value={formData.dateAndTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button type="button" className="px-5 py-2 bg-gray-200 rounded-lg" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-[#1360AB] text-white rounded-lg">
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEventModal
