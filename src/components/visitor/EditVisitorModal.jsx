import React, { useState, useEffect } from "react"
import Button from "../common/Button"
import { securityApi } from "../../services/apiService"
import Modal from "../common/Modal"

const EditVisitorModal = ({ visitor, onClose, refresh }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    room: "",
    status: "Checked In",
    date: "",
    time: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (visitor) {
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
    setLoading(true)
    setError(null)

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
        setError("Failed to update visitor details.")
        return
      }
      if (onClose) onClose()
      if (refresh) refresh()
      onClose()
    } catch (error) {
      setError("An error occurred while updating visitor details.")
      console.error("Error updating visitor:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this visitor?")
    if (!confirmDelete) return

    setLoading(true)
    setError(null)

    try {
      const response = await securityApi.deleteVisitor(visitor._id)
      if (!response) {
        setError("Failed to delete visitor.")
        return
      }
      if (refresh) refresh()
      onClose()
    } catch (error) {
      setError("An error occurred while deleting visitor.")
      console.error("Error deleting visitor:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Edit Visitor Details" onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Visitor Name</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-[#F9FAFC]" placeholder="Enter visitor name" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-[#F9FAFC]" placeholder="Enter phone number" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Visit Date</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-[#F9FAFC]" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Visit Time</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-[#F9FAFC]" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Number</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <input type="text" name="room" value={formData.room} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-[#F9FAFC]" placeholder="Enter room number" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] bg-[#F9FAFC] appearance-none" required>
                <option value="Checked In">Checked In</option>
                <option value="Checked Out">Checked Out</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4 mt-5 border-t border-gray-100">
          <Button type="button" variant="danger" onClick={handleDelete} className={loading ? "opacity-75 cursor-not-allowed" : ""} disabled={loading}>
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Deleting...
              </>
            ) : (
              "Delete Visitor"
            )}
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" variant="primary" className={loading ? "opacity-75 cursor-not-allowed" : ""} disabled={loading}>
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default EditVisitorModal
