import React, { useState, useEffect } from "react"
import { FaExchangeAlt, FaCheck, FaTimes, FaInfoCircle, FaBed, FaUser } from "react-icons/fa"
import { hostelApi } from "../../../services/hostelApi"
import BedSelectionComponent from "../BedSelectionComponent"
import Modal from "../../common/Modal"

const RoomChangeRequestDetailModal = ({ requestId, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [requestedRoomDetails, setRequestedRoomDetails] = useState(null)
  const [selectedBed, setSelectedBed] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [request, setRequest] = useState(null)

  useEffect(() => {
    if (requestId) {
      fetchRequest()
    }
  }, [requestId])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      // Replace with actual API call
      const response = await hostelApi.getRoomChangeRequestById(requestId)

      setRequest(response)
      setRequestedRoomDetails(response.requestedRoom)
    } catch (error) {
      console.error("Error fetching room details:", error)
      setError("Failed to fetch requested room details")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async () => {
    if (!selectedBed && requestedRoomDetails?.occupancy < requestedRoomDetails?.capacity) {
      setError("Please select a bed for the new room allocation")
      return
    }
    try {
      setLoading(true)
      setError(null)

      const response = await hostelApi.approveRoomChangeRequest(request.id, selectedBed)

      if (response.success) {
        onUpdate()
      } else {
        setError(response.message || "Failed to approve request")
      }
    } catch (err) {
      setError("An error occurred while approving the request. Please try again.")
      console.error("Error approving request:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectRequest = async () => {
    try {
      setLoading(true)
      setError(null)

      // Replace with actual API call
      const response = await hostelApi.rejectRoomChangeRequest(request.id, rejectionReason)

      if (response.success) {
        onUpdate()
      } else {
        setError(response.message || "Failed to reject request")
      }
    } catch (err) {
      setError("An error occurred while rejecting the request. Please try again.")
      console.error("Error rejecting request:", err)
    } finally {
      setLoading(false)
    }
  }

  const isRoomAvailable = () => {
    if (!requestedRoomDetails) return false
    return requestedRoomDetails.occupancy < requestedRoomDetails.capacity
  }

  const isPending = request?.status === "Pending"

  return (
    <Modal title="Room Change Request Details" onClose={onClose} width={800}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="relative w-14 h-14">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1360AB] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading request details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-5 rounded-lg text-center">
          <FaInfoCircle className="text-red-500 mx-auto mb-3 text-xl" />
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={fetchRequest} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
            Try Again
          </button>
        </div>
      ) : request ? (
        <div>
          {/* Request Status Badge */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${request.status === "Pending" ? "bg-yellow-100 text-yellow-800" : request.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {request.status === "Pending" ? "Pending" : request.status === "approved" ? "Approved" : "Rejected"}
            </div>

            {request.status === "rejected" && request.rejectionReason && <div className="mt-2 text-sm text-red-600">Rejection reason: {request.rejectionReason}</div>}
          </div>

          {/* Student Info */}
          <div className="bg-gray-50 p-5 rounded-xl mb-6">
            <h3 className="font-medium text-gray-700 mb-3 flex items-center">
              <FaUser className="mr-2 text-[#1360AB]" /> Student Information
            </h3>
            <div className="flex items-start">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-[#1360AB] font-bold text-xl">{request.student?.name?.charAt(0) || "S"}</div>
              <div className="ml-4">
                <div className="text-lg font-medium">{request.student?.name}</div>
                <div className="text-gray-500">{request.student?.email}</div>
                <div className="text-sm text-gray-500 mt-1">Roll Number: {request.student?.rollNumber}</div>
              </div>
            </div>
          </div>

          {/* Room Change Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 p-5 rounded-xl">
              <h3 className="font-medium text-gray-700 mb-3">Current Room</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Unit:</span>
                  <span className="font-medium">{request.currentRoom?.unitNumber || "N/A"}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Room Number:</span>
                  <span className="font-medium bg-white px-3 py-1 rounded-lg border border-blue-100">{request.currentRoom?.roomNumber}</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 p-5 rounded-xl">
              <h3 className="font-medium text-gray-700 mb-3">Requested Room</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Building:</span>
                  <span className="font-medium">{request.currentRoom?.unitNumber || "N/A"}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Room Number:</span>
                  <span className="font-medium bg-white px-3 py-1 rounded-lg border border-green-100">{request.requestedRoom?.roomNumber}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Availability:</span>
                  <span className="font-medium">{requestedRoomDetails ? `${requestedRoomDetails.occupancy}/${requestedRoomDetails.capacity} occupied` : "Unknown"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Reason for Request */}
          <div className="bg-gray-50 p-5 rounded-xl mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Reason for Request</h3>
            <p className="text-gray-700">{request.reason || "No reason provided"}</p>
          </div>

          {/* reason for rejection */}
          {request.status === "Rejected" && request.rejectionReason && (
            <div className="bg-red-50 p-5 rounded-xl mb-6">
              <h3 className="font-medium text-red-700 mb-2">Rejection Reason</h3>
              <p className="text-red-700">{request.rejectionReason}</p>
            </div>
          )}

          {/* Bed Selection (if request is pending and room is available) */}
          {isPending && (
            <>
              {isRoomAvailable() ? (
                <div className="bg-white border rounded-xl p-5 mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <FaBed className="mr-2 text-[#1360AB]" /> Select Bed for New Allocation
                  </h3>
                  <BedSelectionComponent roomDetails={requestedRoomDetails} selectedBed={selectedBed} onSelectBed={setSelectedBed} />
                </div>
              ) : (
                <div className="bg-yellow-50 p-5 rounded-xl mb-6 flex items-start">
                  <FaInfoCircle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Room Not Available</h3>
                    <p className="text-yellow-700 text-sm mt-1">The requested room is currently at full capacity. You cannot approve this request.</p>
                  </div>
                </div>
              )}

              {/* Rejection Reason Input (for pending requests) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason (optional)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejecting this request"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-100 focus:border-[#1360AB] outline-none resize-none h-24"
                />
              </div>
            </>
          )}

          {error && <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4 border-l-4 border-red-500">{error}</div>}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 mt-6 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2.5 mt-3 sm:mt-0 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Close
            </button>

            {isPending && request && (
              <div className="flex flex-col-reverse sm:flex-row space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
                <button onClick={handleRejectRequest} disabled={loading} className="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center">
                  {loading ? <div className="animate-spin h-4 w-4 mr-2 border-2 border-red-700 border-t-transparent rounded-full"></div> : <FaTimes className="mr-2" />}
                  Reject Request
                </button>

                <button
                  onClick={handleApproveRequest}
                  disabled={loading || !isRoomAvailable() || (!selectedBed && isRoomAvailable())}
                  className={`px-4 py-2.5 rounded-lg flex items-center justify-center ${loading || !isRoomAvailable() || (!selectedBed && isRoomAvailable()) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                >
                  {loading ? <div className="animate-spin h-4 w-4 mr-2 border-2 border-green-700 border-t-transparent rounded-full"></div> : <FaCheck className="mr-2" />}
                  Approve Request
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No request data available</div>
      )}
    </Modal>
  )
}

export default RoomChangeRequestDetailModal
