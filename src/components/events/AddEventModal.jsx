import React, { useState } from "react"
import { eventsApi } from "../../services/apiService"
import Modal from "../common/Modal"
import { FaCalendarAlt, FaClipboardList, FaBuilding } from "react-icons/fa"
import { BsClock } from "react-icons/bs"
import { useGlobal } from "../../contexts/GlobalProvider"

const AddEventModal = ({ show, onClose, onEventAdded }) => {
  const { hostelList } = useGlobal()

  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    dateAndTime: new Date().toISOString().slice(0, 16),
    hostelId: "all",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { eventName, description, dateAndTime, hostelId } = formData
    if (!eventName || !description || !dateAndTime) {
      alert("Please fill in all fields.")
      return
    }

    const eventData = {
      eventName,
      description,
      dateAndTime,
      ...(hostelId !== "all" && { hostelId }),
    }

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
    <Modal title="Add New Event" onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Event Name</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaClipboardList />
              </div>
              <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" placeholder="Enter event name" required />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Hostel</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaBuilding />
              </div>
              <select name="hostelId" value={formData.hostelId} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" required>
                <option value="all">All Hostels</option>
                {hostelList?.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all resize-none"
              placeholder="Describe the event, location, activities, etc."
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Date and Time</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <BsClock />
              </div>
              <input type="datetime-local" name="dateAndTime" value={formData.dateAndTime} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" required />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end pt-5 mt-6 border-t border-gray-100 space-y-3 sm:space-y-0 sm:space-x-3">
          <button type="button" className="order-last sm:order-first px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow font-medium">
            Add Event
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddEventModal
