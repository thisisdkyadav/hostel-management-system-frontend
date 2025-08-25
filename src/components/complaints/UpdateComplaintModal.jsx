import React, { useState } from "react"
import { FaEdit } from "react-icons/fa"
import Modal from "../common/Modal"
import { complaintApi } from "../../services/complaintApi"

const UpdateComplaintModal = ({ complaint, onClose, onUpdate }) => {
  const [status, setStatus] = useState(complaint?.status || "")
  const [resolutionNotes, setResolutionNotes] = useState(complaint?.resolutionNotes || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const statusOptions = ["Pending", "In Progress", "Resolved", "Forwarded to IDO", "Rejected"]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Update status if changed
      if (status !== complaint.status) {
        await complaintApi.updateStatus(complaint.id, status)
      }

      // Update resolution notes if changed
      if (resolutionNotes !== complaint.resolutionNotes) {
        await complaintApi.updateComplaintResolutionNotes(complaint.id, resolutionNotes)
      }

      onUpdate({
        ...complaint,
        status,
        resolutionNotes,
        lastUpdated: new Date().toISOString(),
      })
      onClose()
    } catch (err) {
      setError("Failed to update complaint. Please try again.")
      console.error("Error updating complaint:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Update Complaint" onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="resolutionNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Resolution Notes
          </label>
          <textarea id="resolutionNotes" value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} rows={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Enter resolution notes or comments..."></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <FaEdit className="mr-2" /> Update Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default UpdateComplaintModal
