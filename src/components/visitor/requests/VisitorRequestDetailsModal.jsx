import React, { useState } from "react"
import { FaUser, FaCalendarAlt, FaInfoCircle, FaBuilding, FaMapMarkerAlt } from "react-icons/fa"
import Modal from "../../common/Modal"
import { visitorApi } from "../../../services/visitorApi"
import { useAuth } from "../../../contexts/AuthProvider"
import { useGlobal } from "../../../contexts/GlobalProvider"

const VisitorRequestDetailsModal = ({ isOpen, onClose, request, onRefresh }) => {
  const { user } = useAuth()
  const { hostelList = [] } = useGlobal()
  const [selectedHostel, setSelectedHostel] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showApproveForm, setShowApproveForm] = useState(false)

  if (!isOpen || !request) return null

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
    }
    return statusColors[status.toLowerCase()] || statusColors.pending
  }

  const handleCancelRequest = async () => {
    if (window.confirm("Are you sure you want to cancel this visitor request?")) {
      try {
        await visitorApi.cancelVisitorRequest(request._id)
        onRefresh()
        onClose()
      } catch (error) {
        console.error("Error canceling request:", error)
        alert("Failed to cancel request. Please try again.")
      }
    }
  }

  const handleApproveRequest = async () => {
    if (!selectedHostel) {
      alert("Please select a hostel to assign for this visit.")
      return
    }

    try {
      await visitorApi.approveVisitorRequest(request._id, selectedHostel)
      onRefresh()
      onClose()
    } catch (error) {
      console.error("Error approving request:", error)
      alert("Failed to approve request. Please try again.")
    }
  }

  const handleRejectRequest = async () => {
    try {
      await visitorApi.rejectVisitorRequest(request._id, rejectionReason)
      onRefresh()
      onClose()
    } catch (error) {
      console.error("Error rejecting request:", error)
      alert("Failed to reject request. Please try again.")
    }
  }

  const toggleApproveForm = () => {
    setShowApproveForm(!showApproveForm)
    setShowRejectForm(false)
  }

  const toggleRejectForm = () => {
    setShowRejectForm(!showRejectForm)
    setShowApproveForm(false)
  }

  return (
    <Modal title="Visitor Request Details" onClose={onClose} width={650}>
      <div className="space-y-6">
        {/* Request Status */}
        <div className={`p-4 rounded-lg border ${getStatusColor(request.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaInfoCircle className="mr-2" />
              <span className="font-medium">Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
            </div>
            <div className="text-sm">Request ID: #{request._id?.substring(0, 8)}</div>
          </div>
          {request.status === "rejected" && request.rejectionReason && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Reason for rejection:</span> {request.rejectionReason}
            </div>
          )}
          {request.status === "approved" && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Approved on:</span> {formatDate(request.approvedAt || new Date())}
            </div>
          )}
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <FaCalendarAlt className="mr-2 text-[#1360AB]" /> Visit Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">From Date:</span>
                <span className="font-medium text-sm">{formatDate(request.fromDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">To Date:</span>
                <span className="font-medium text-sm">{formatDate(request.toDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Duration:</span>
                <span className="font-medium text-sm">{Math.ceil((new Date(request.toDate) - new Date(request.fromDate)) / (1000 * 60 * 60 * 24))} days</span>
              </div>
            </div>
          </div>

          {request.status === "approved" && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FaBuilding className="mr-2 text-[#1360AB]" /> Accommodation Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Hostel:</span>
                  <span className="font-medium text-sm">{request.hostelAssigned || "Not assigned yet"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Room Number:</span>
                  <span className="font-medium text-sm">{request.roomAssigned || "Not assigned yet"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Room Type:</span>
                  <span className="font-medium text-sm">{request.roomType || "Standard"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reason for Visit */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Reason for Visit</h3>
          <p className="text-sm text-gray-600">{request.reason}</p>
        </div>

        {/* Visitors List */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <FaUser className="mr-2 text-[#1360AB]" /> Visitor Information
          </h3>
          <div className="space-y-3">
            {request.visitors.map((visitor, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <h4 className="font-medium text-gray-800">{visitor.name}</h4>
                    <p className="text-sm text-gray-600">Relation: {visitor.relation}</p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-sm text-gray-600">{visitor.phone}</span>
                    <span className="text-sm text-gray-600">{visitor.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Check-in/out (if applicable) */}
        {request.status === "approved" && request.checkInTime && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-[#1360AB]" /> Security Check
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 text-sm block">Check-in:</span>
                <span className="font-medium">{new Date(request.checkInTime).toLocaleString()}</span>
              </div>
              {request.checkOutTime && (
                <div>
                  <span className="text-gray-600 text-sm block">Check-out:</span>
                  <span className="font-medium">{new Date(request.checkOutTime).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Approve Form (for Admin) */}
        {["Admin"].includes(user.role) && request.status.toLowerCase() === "pending" && showApproveForm && (
          <div className="bg-green-50 border border-green-100 p-4 rounded-lg animate-fadeIn">
            <h3 className="font-medium text-green-800 mb-3">Approve Visitor Request</h3>
            <div className="mb-3">
              <label htmlFor="hostel-select" className="block text-sm font-medium text-gray-700 mb-1">
                Assign Hostel <span className="text-red-500">*</span>
              </label>
              <select id="hostel-select" value={selectedHostel} onChange={(e) => setSelectedHostel(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Select a hostel</option>
                {hostelList.map((hostel) => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowApproveForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleApproveRequest} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Confirm Approval
              </button>
            </div>
          </div>
        )}

        {/* Reject Form (for Admin) */}
        {["Admin"].includes(user.role) && request.status.toLowerCase() === "pending" && showRejectForm && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg animate-fadeIn">
            <h3 className="font-medium text-red-800 mb-3">Reject Visitor Request</h3>
            <div className="mb-3">
              <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection (Optional)
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Please provide an optional reason for rejection"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowRejectForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleRejectRequest} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Confirm Rejection
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
          {["Student"].includes(user.role) && request.status.toLowerCase() === "pending" && (
            <button onClick={handleCancelRequest} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors mr-3">
              Cancel Request
            </button>
          )}
          {/* Admin action buttons */}
          {["Admin"].includes(user.role) && request.status.toLowerCase() === "pending" && (
            <>
              <button onClick={toggleApproveForm} className={`px-4 py-2 rounded-lg mr-3 transition-colors ${showApproveForm ? "bg-green-600 text-white" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                {showApproveForm ? "Hide Approval Form" : "Approve Request"}
              </button>
              <button onClick={toggleRejectForm} className={`px-4 py-2 rounded-lg mr-3 transition-colors ${showRejectForm ? "bg-red-600 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"}`}>
                {showRejectForm ? "Hide Rejection Form" : "Reject Request"}
              </button>
            </>
          )}
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default VisitorRequestDetailsModal
