import React, { useState, useEffect } from "react"
import { FaTimes } from "react-icons/fa"
import Button from "../common/Button"
import { securityApi } from "../../services/apiService"

const EditVisitorModal = ({ visitor, onClose }) => {
  // Using the structure from the API data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    room: "",
    status: "Checked In",
    dateTime: new Date().toISOString(),
  })

  useEffect(() => {
    if (visitor) {
      // Extract date and time from DateTime if available
      let date = ""
      let time = ""

      if (visitor.DateTime) {
        const dateObj = new Date(visitor.DateTime)
        date = dateObj.toISOString().split("T")[0]
        time = dateObj.toTimeString().split(" ")[0].substring(0, 5)
      }

      setFormData({
        name: visitor.name || "",
        phone: visitor.phone || "",
        room: visitor.room || "",
        status: visitor.status || "Checked In",
        date: date,
        time: time,
      })
    }
  }, [visitor])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Combine date and time into DateTime
    const dateTime = formData.date && formData.time ? new Date(`${formData.date}T${formData.time}`).toISOString() : new Date().toISOString()

    const updatedVisitor = {
      ...visitor,
      name: formData.name,
      phone: formData.phone,
      room: formData.room,
      status: formData.status,
      DateTime: dateTime,
    }

    try {
      const response = await securityApi.updateVisitor(visitor._id, updatedVisitor)
      if (!response) {
        alert("Failed to update visitor details.")
        return
      }
      alert("Visitor details updated successfully!")
      onClose()
    } catch (error) {
      alert("An error occurred while updating visitor details.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-[20px] p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Edit Visitor Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input type="text" name="room" value={formData.room} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#EFF3F4] text-gray-800 px-4 py-2 rounded-md" required>
                <option value="Checked In">Checked In</option>
                <option value="Checked Out">Checked Out</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditVisitorModal
