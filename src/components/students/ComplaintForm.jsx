import React, { useState, useEffect } from "react"
import { FaBuilding, FaClipboardList, FaExclamationTriangle } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"
import { complaintApi } from "../../services/complaintApi"
import Modal from "../common/Modal"

const ComplaintForm = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    attachments: "",
    priority: "",
    location: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const complaintData = {
        userId: user._id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        attachments: formData.attachments,
        priority: formData.priority,
        location: formData.location,
      }

      await complaintApi.createComplaint(complaintData)
      alert("Complaint submitted successfully!")
      setIsOpen(false)
      setFormData({
        title: "",
        description: "",
        category: "",
        attachments: "",
        priority: "",
        location: "",
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Submit New Complaint" onClose={() => setIsOpen(false)} width={650}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Complaint Title</label>
            <input type="text" name="title" placeholder="Brief summary of the issue" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" value={formData.title} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              placeholder="Please provide details about the issue..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all resize-none h-28"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* location only for warden, associate warden, hostel supervisor, admin */}
          {["Warden", "Associate Warden", "Hostel Supervisor", "Admin"].includes(user?.role) && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Location</label>
              <input type="text" name="location" placeholder="Location" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" value={formData.location} onChange={handleChange} required />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FaClipboardList />
                </div>
                <select name="category" className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all bg-white" value={formData.category} onChange={handleChange} required>
                  <option value="" disabled>
                    Select Category
                  </option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Internet">Internet</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Civil">Civil</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Priority</label>
              <select name="priority" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all bg-white" value={formData.priority} onChange={handleChange} required>
                <option value="" disabled>
                  Select Priority
                </option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end pt-5 mt-6 border-t border-gray-100 space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
          <button type="button" className="order-last sm:order-first px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
          <button type="submit" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all shadow-sm hover:shadow font-medium flex items-center justify-center" disabled={loading}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              "Submit Complaint"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ComplaintForm
