import React, { useState } from "react"
import { FaCalendarAlt, FaSave, FaBuilding, FaUserFriends } from "react-icons/fa"
import { MdCancel, MdDelete } from "react-icons/md"
import { BsClock } from "react-icons/bs"
import { useGlobal } from "../../contexts/GlobalProvider"

const EventEditForm = ({ event, onCancel, onSave, onDelete }) => {
  const { hostelList } = useGlobal()

  const [formData, setFormData] = useState({
    eventName: event.eventName,
    description: event.description,
    dateAndTime: event.dateAndTime.slice(0, 16),
    hostelId: event.hostelId || "all",
    gender: event.gender || "all",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const updatedEvent = {
      ...event,
      ...formData,
    }

    if (updatedEvent.hostelId === "all") {
      delete updatedEvent.hostelId
    }

    if (updatedEvent.gender === "all") {
      updatedEvent.gender = null
    }

    onSave(updatedEvent)
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      onDelete(event._id)
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-4">
          <div className={`p-2.5 mr-3 rounded-xl bg-blue-100 text-blue-600`}>
            <FaCalendarAlt size={20} />
          </div>
          <div className="w-full">
            <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} className="font-bold text-lg w-full border-b border-gray-300 focus:border-[#1360AB] outline-none pb-1" required />
            <span className="text-xs text-gray-500">ID: {event._id.substring(0, 8)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Date and Time</label>
            <input type="datetime-local" name="dateAndTime" value={formData.dateAndTime} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Hostel</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaBuilding />
              </div>
              <select name="hostelId" value={formData.hostelId} onChange={handleChange} className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]">
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
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Gender</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaUserFriends />
              </div>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]">
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-3 focus:border-[#1360AB] focus:ring-1 focus:ring-blue-100 outline-none resize-none"
              placeholder="Event description"
            ></textarea>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between sm:items-center space-y-3 space-y-reverse sm:space-y-0">
          <button type="button" onClick={handleDelete} className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
            <MdDelete className="mr-2" /> Delete
          </button>

          <div className="flex flex-col-reverse sm:flex-row space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button type="button" onClick={onCancel} className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <MdCancel className="mr-2" /> Cancel
            </button>
            <button type="submit" className="flex items-center justify-center px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors">
              <FaSave className="mr-2" /> Save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EventEditForm
