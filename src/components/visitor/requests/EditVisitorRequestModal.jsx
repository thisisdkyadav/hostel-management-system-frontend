import React, { useState, useEffect } from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import Modal from "../../common/Modal"
import { visitorApi } from "../../../services/visitorApi"

const EditVisitorRequestModal = ({ isOpen, onClose, request, onRefresh }) => {
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (request) {
      // Format the dates for the date input
      const fromDate = new Date(request.fromDate)
      const toDate = new Date(request.toDate)

      setFormData({
        reason: request.reason || "",
        fromDate: fromDate.toISOString().split("T")[0],
        toDate: toDate.toISOString().split("T")[0],
      })
    }
  }, [request])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validations
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
      const updatedRequestData = {
        reason: formData.reason,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
      }

      await visitorApi.updateVisitorRequest(request._id, updatedRequestData)
      onRefresh()
      onClose()
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !request) return null

  return (
    <Modal title="Edit Visitor Request" onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> You can only modify the dates and reason for your visit. If you need to change visitors, please cancel this request and create a new one.
          </p>
        </div>

        {/* Visitor Information (Non-editable) */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Visitor Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Visitors:</span> {request.visitors?.map((v) => v.name).join(", ")}
            </p>
          </div>
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
          <button type="submit" className="px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors" disabled={loading}>
            {loading ? "Saving..." : "Update Request"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditVisitorRequestModal
