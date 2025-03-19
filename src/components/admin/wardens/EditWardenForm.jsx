import React, { useState, useEffect } from "react"
import { FaTrash, FaSave, FaTimes } from "react-icons/fa"
import { adminApi } from "../../../services/apiService"
import { useAdmin } from "../../../contexts/AdminProvider"

const EditWardenForm = ({ warden, onClose }) => {
  const { hostelList } = useAdmin()

  const [formData, setFormData] = useState({
    phone: warden.phone || "",
    hostelId: warden.hostelId || "",
    joinDate: warden.joinDate ? new Date(warden.joinDate).toISOString().split("T")[0] : "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const message = await adminApi.updateWarden(warden.id, formData)
      if (!message) {
        alert("Failed to update warden. Please try again.")
        return
      }
      alert("Warden updated successfully!")
      onClose()
    } catch (error) {
      console.error("Failed to update warden:", error)
      alert("Failed to update warden. Please try again.")
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this warden?")
    if (confirmDelete) {
      try {
        const message = await adminApi.deleteWarden(warden.id)
        if (!message) {
          alert("Failed to delete warden. Please try again.")
          return
        }
        alert("Warden deleted successfully!")
        onClose()
      } catch (error) {
        console.error("Failed to delete warden:", error)
        alert("Failed to delete warden. Please try again.")
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Edit Warden</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter phone number" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Assignment</label>
              <select name="hostelId" value={formData.hostelId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a hostel</option>
                {hostelList.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center">
              <FaTrash className="mr-2" /> Delete
            </button>

            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center">
              <FaSave className="mr-2" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditWardenForm
