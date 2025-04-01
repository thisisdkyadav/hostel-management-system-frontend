import React, { useState } from "react"
import { FaExclamationTriangle, FaPlus, FaUserAlt } from "react-icons/fa"
import Modal from "../../common/Modal"

const AddVisitorRequestModal = ({ isOpen, onClose, onSubmit, visitorProfiles }) => {
  const [formData, setFormData] = useState({
    selectedVisitorIds: [],
    reason: "",
    fromDate: "",
    toDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Calculate minimum selectable date (today + 2 days)
  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 2)
  const minDateString = minDate.toISOString().split("T")[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVisitorSelection = (visitorId) => {
    setFormData((prev) => {
      const currentSelected = [...prev.selectedVisitorIds]

      if (currentSelected.includes(visitorId)) {
        return {
          ...prev,
          selectedVisitorIds: currentSelected.filter((id) => id !== visitorId),
        }
      } else {
        return {
          ...prev,
          selectedVisitorIds: [...currentSelected, visitorId],
        }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validations
    if (formData.selectedVisitorIds.length === 0) {
      setError("Please select at least one visitor")
      return
    }

    if (!formData.fromDate || !formData.toDate) {
      setError("Please select both from and to dates")
      return
    }

    const fromDate = new Date(formData.fromDate)
    const toDate = new Date(formData.toDate)

    if (fromDate < minDate) {
      setError("Please select a from date that is at least 2 days from today")
      return
    }

    if (toDate < fromDate) {
      setError("To date cannot be earlier than from date")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get the full visitor objects for selected IDs
      const selectedVisitors = visitorProfiles.filter((profile) => formData.selectedVisitorIds.includes(profile._id))

      const requestData = {
        visitors: selectedVisitors,
        reason: formData.reason,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
      }

      const success = await onSubmit(requestData)
      if (success) {
        setFormData({
          selectedVisitorIds: [],
          reason: "",
          fromDate: "",
          toDate: "",
        })
        onClose()
      } else {
        setError("Failed to submit visitor request. Please try again.")
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal title="Create Visitor Request" onClose={onClose} width={650}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Visitor Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">Select Visitors</h3>
            <button type="button" onClick={() => onClose()} className="text-sm text-[#1360AB] hover:text-blue-700 flex items-center">
              <FaPlus size={12} className="mr-1" /> Add New Profile
            </button>
          </div>

          {visitorProfiles.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500 text-sm">No visitor profiles found. Add some profiles first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
              {visitorProfiles.map((visitor) => (
                <div key={visitor._id} onClick={() => handleVisitorSelection(visitor._id)} className={`border p-3 rounded-lg cursor-pointer transition-colors ${formData.selectedVisitorIds.includes(visitor._id) ? "border-[#1360AB] bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${formData.selectedVisitorIds.includes(visitor._id) ? "bg-[#1360AB] text-white" : "bg-gray-200 text-gray-500"}`}>
                      <FaUserAlt size={12} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{visitor.name}</h4>
                      <div className="text-xs text-gray-500">
                        <p>{visitor.relation}</p>
                        <p>{visitor.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">From Date</label>
            <input type="date" name="fromDate" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition" value={formData.fromDate} onChange={handleChange} min={minDateString} required />
            <p className="text-xs text-gray-500 mt-1">Must be at least 2 days from today</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">To Date</label>
            <input type="date" name="toDate" className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition" value={formData.toDate} onChange={handleChange} min={formData.fromDate || minDateString} required />
          </div>
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Reason for Visit</label>
          <textarea
            name="reason"
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1360AB] focus:ring-1 focus:ring-[#1360AB] outline-none transition resize-none"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Please provide details about the purpose of the visit"
            required
          />
        </div>

        {/* Submit Section */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mr-3">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors" disabled={loading || visitorProfiles.length === 0}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddVisitorRequestModal
