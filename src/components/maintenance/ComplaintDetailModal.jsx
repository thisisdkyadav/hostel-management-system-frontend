import React, { useState, useCallback } from "react"
import { FaMapMarkerAlt, FaUserCircle, FaClipboardList, FaInfoCircle, FaTimes } from "react-icons/fa"
import { getStatusColor, getPriorityColor } from "../../utils/adminUtils"
import Modal from "../common/Modal"
import { maintenanceApi } from "../../services/apiService"

const ComplaintDetailModal = ({ selectedComplaint, setShowDetailModal, refreshComplaints, show }) => {
  if (!selectedComplaint || !show) return null

  const [newStatus, setNewStatus] = useState(selectedComplaint.status)
  const [updating, setUpdating] = useState(false)

  const handleClose = useCallback(() => {
    setShowDetailModal(false)
  }, [setShowDetailModal])

  const handleStatusUpdate = async (status) => {
    try {
      setUpdating(true)
      await maintenanceApi.updateComplaintStatus(selectedComplaint.id, status)
      refreshComplaints && refreshComplaints()
    } catch (error) {
      console.error("Error updating complaint status:", error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Modal title="Complaint Details" onClose={handleClose} width={800} show={show}>
      {/* Cross button to close dialog */}
      <button onClick={handleClose} type="button" aria-label="Close" className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer z-50 rounded-full hover:bg-gray-100">
        <FaTimes size={20} />
      </button>

      <div className="space-y-6">
        {/* Header with Complaint ID and Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-100">
          <div>
            <span className="text-xs text-gray-500">Complaint ID: {selectedComplaint.id}</span>
            <h2 className="text-xl font-bold text-gray-800 mt-1">{selectedComplaint.title}</h2>
          </div>
          <div className="flex items-center space-x-3 mt-3 sm:mt-0">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(newStatus)}`}>{newStatus}</span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>{selectedComplaint.priority}</span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">{selectedComplaint.category}</span>
          </div>
        </div>

        {/* Location & Reporter Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-xl">
            <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-4">
              <FaMapMarkerAlt className="mr-2" /> Location Details
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Hostel:</span>
                <span className="font-medium">{selectedComplaint.hostel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room Number:</span>
                <span className="font-medium">{selectedComplaint.roomNumber}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl">
            <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-4">
              <FaUserCircle className="mr-2" /> Reported By
            </h4>
            <div className="flex items-center">
              {selectedComplaint.reportedBy?.profileImage ? (
                <img src={selectedComplaint.reportedBy.profileImage} alt={selectedComplaint.reportedBy.name} className="h-12 w-12 rounded-full object-cover mr-4" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-medium mr-4">{selectedComplaint.reportedBy?.name?.charAt(0) || "U"}</div>
              )}
              <div>
                <div className="font-medium">{selectedComplaint.reportedBy?.name}</div>
                <div className="text-sm text-gray-500">Email: {selectedComplaint.reportedBy?.email}</div>
                <div className="text-sm text-gray-500">{selectedComplaint.reportedBy?.phone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-3">
            <FaClipboardList className="mr-2" /> Description
          </h4>
          <div className="bg-gray-50 p-5 rounded-xl text-gray-700">{selectedComplaint.description}</div>
        </div>

        {/* Resolution Notes */}
        <div>
          <h4 className="text-sm font-medium text-[#1360AB] flex items-center mb-3">
            <FaInfoCircle className="mr-2" /> Resolution Notes
          </h4>
          {selectedComplaint.resolutionNotes ? <div className="bg-gray-50 p-5 rounded-xl text-gray-700">{selectedComplaint.resolutionNotes}</div> : <div className="bg-gray-50 p-5 rounded-xl text-gray-500 italic">No resolution notes yet.</div>}
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
          <div>Created: {new Date(selectedComplaint.createdDate).toLocaleString()}</div>
          {selectedComplaint.lastUpdated !== selectedComplaint.createdDate && <div>Last Updated: {new Date(selectedComplaint.lastUpdated).toLocaleString()}</div>}
        </div>

        {/* Update Status Section - without update button */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-[#1360AB] mb-2">Update Complaint Status</h4>
          <div className="flex items-center">
            <select
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB]"
              value={newStatus}
              onChange={(e) => {
                const updatedStatus = e.target.value
                setNewStatus(updatedStatus)
                handleStatusUpdate(updatedStatus)
              }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ComplaintDetailModal
