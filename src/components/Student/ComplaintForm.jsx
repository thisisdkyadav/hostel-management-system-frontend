import React, { useState, useEffect } from "react"
import { FaBuilding, FaClipboardList, FaExclamationTriangle } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthProvider"
import { submitComplaint } from "../../services/studentService"
import { adminApi } from "../../services/apiService"
import Modal from "../common/Modal"

const ComplaintForm = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth()
  const [hostelList, setHostelList] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    hostelId: "",
    room: "",
    unit: "",
    attachments: "",
    priority: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const data = await adminApi.getHostelList()
        setHostelList(data)
      } catch (error) {
        console.error("Error fetching hostel list:", error)
      }
    }
    fetchHostels()
  }, [])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "hostel") {
      const selectedHostel = hostelList.find((h) => h.name === value)
      setFormData((prev) => ({
        ...prev,
        hostel: value,
        hostelId: selectedHostel ? selectedHostel._id : "",
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
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
        hostelId: formData.hostelId,
        room: formData.room,
        unit: formData.unit,
        attachments: formData.attachments,
        priority: formData.priority,
      }

      await submitComplaint(complaintData)
      alert("Complaint submitted successfully!")
      setIsOpen(false)
      setFormData({
        title: "",
        description: "",
        category: "",
        hostelId: "",
        room: "",
        unit: "",
        attachments: "",
        priority: "",
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

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Hostel</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <FaBuilding />
              </div>
              <select name="hostelId" className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all bg-white" value={formData.hostelId} onChange={handleChange} required>
                <option value="" disabled>
                  Select Hostel
                </option>
                {hostelList.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Unit</label>
              <input type="text" name="unit" placeholder="Unit" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" value={formData.unit} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Room Number</label>
              <input type="text" name="room" placeholder="Room number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" value={formData.room} onChange={handleChange} required />
            </div>
          </div>

          {/* <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Attachment URL (optional)</label>
            <input type="text" name="attachments" placeholder="URL to an image of the issue" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none transition-all" value={formData.attachments} onChange={handleChange} />
          </div> */}
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
