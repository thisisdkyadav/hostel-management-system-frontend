import React, { useState, useEffect } from "react"
import { MdClose } from "react-icons/md"
import { FaExchangeAlt, FaCheck, FaTimes, FaInfoCircle, FaBed, FaUser } from "react-icons/fa"
import { hostelApi } from "../../services/apiService"
import BedSelectionComponent from "./BedSelectionComponent"

const RoomChangeRequestDetailModal = ({ requestId, onClose, onUpdate }) => {
  console.log("requestId", requestId)

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
    if (!selectedBed && requestedRoomDetails?.currentOccupancy < requestedRoomDetails?.capacity) {
      setError("Please select a bed for the new room allocation")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Replace with actual API call
      const response = await hostelApi.approveRoomChangeRequest({
        requestId: request.id,
        bedNumber: selectedBed,
      })

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
      const response = await hostelApi.rejectRoomChangeRequest({
        requestId: request.id,
        reason: rejectionReason,
      })

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
    return requestedRoomDetails.currentOccupancy < requestedRoomDetails.capacity
  }

  const isPending = request?.status === "Pending"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <FaExchangeAlt className="mr-2 text-[#1360AB]" />
            Room Change Request Details
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <MdClose size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1360AB] mb-4"></div>
              <p className="text-gray-600">Loading request details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <FaInfoCircle className="text-red-500 mx-auto mb-2 text-xl" />
              <p className="text-red-600">{error}</p>
              <button onClick={fetchRequest} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                Try Again
              </button>
            </div>
          ) : request ? (
            <>
              {/* Request Status Badge */}
              <div className="mb-6">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${request.status === "pending" ? "bg-yellow-100 text-yellow-800" : request.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {request.status === "pending" ? "Pending" : request.status === "approved" ? "Approved" : "Rejected"}
                </div>

                {request.status === "rejected" && request.rejectionReason && <div className="mt-2 text-sm text-red-600">Rejection reason: {request.rejectionReason}</div>}
              </div>

              {/* Student Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FaUser className="mr-2" /> Student Information
                </h3>
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">{request.student?.name?.charAt(0) || "S"}</div>
                  <div className="ml-4">
                    <div className="text-lg font-medium">{request.student?.name}</div>
                    <div className="text-gray-500">{request.student?.email}</div>
                    <div className="text-sm text-gray-500 mt-1">Roll Number: {request.student?.rollNumber}</div>
                  </div>
                </div>
              </div>

              {/* Room Change Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Current Room</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Room Number:</span>
                      <span className="font-medium">{request.currentRoom?.roomNumber}</span>
                    </li>
                    {/* <li className="flex justify-between">
                      <span className="text-gray-500">Hostel:</span>
                      <span className="font-medium">{request.currentRoom?.hostel}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Floor:</span>
                      <span className="font-medium">{request.currentRoom?.floor || "N/A"}</span>
                    </li> */}
                    {/* <li className="flex justify-between">
                      <span className="text-gray-500">Bed Number:</span>
                      <span className="font-medium">{request.currentBedNumber || "N/A"}</span>
                    </li> */}
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Requested Room</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Room Number:</span>
                      <span className="font-medium">{request.requestedRoom?.roomNumber}</span>
                    </li>
                    {/* <li className="flex justify-between">
                      <span className="text-gray-500">Hostel:</span>
                      <span className="font-medium">{request.requestedRoom?.hostel}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Floor:</span>
                      <span className="font-medium">{request.requestedRoom?.floor || "N/A"}</span>
                    </li> */}
                    <li className="flex justify-between">
                      <span className="text-gray-500">Availability:</span>
                      <span className="font-medium">{requestedRoomDetails ? `${requestedRoomDetails.occupancy}/${requestedRoomDetails.capacity} occupied` : "Unknown"}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Reason for Request */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Reason for Request</h3>
                <p className="text-gray-700">{request.reason || "No reason provided"}</p>
              </div>
              {/* Bed Selection (if request is pending and room is available) */}
              {isPending && (
                <>
                  {isRoomAvailable() ? (
                    <div className="bg-white border rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                        <FaBed className="mr-2" /> Select Bed for New Allocation
                      </h3>
                      <BedSelectionComponent roomDetails={requestedRoomDetails} selectedBed={selectedBed} onSelectBed={setSelectedBed} />
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg mb-6 flex items-start">
                      <FaInfoCircle className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-yellow-800">Room Not Available</h3>
                        <p className="text-yellow-700 text-sm">The requested room is currently at full capacity. You cannot approve this request.</p>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason Input (for pending requests) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (optional)</label>
                    <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Provide a reason for rejecting this request" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 h-24" />
                  </div>
                </>
              )}

              {error && <div className="bg-red-50 p-3 rounded-md text-red-700 mb-4">{error}</div>}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">No request data available</div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Close
          </button>

          {isPending && request && (
            <div className="flex space-x-3">
              <button onClick={handleRejectRequest} disabled={loading} className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center">
                {loading ? <div className="animate-spin h-4 w-4 mr-2 border-2 border-red-700 border-t-transparent rounded-full"></div> : <FaTimes className="mr-2" />}
                Reject Request
              </button>

              <button
                onClick={handleApproveRequest}
                disabled={loading || !isRoomAvailable() || (!selectedBed && isRoomAvailable())}
                className={`px-4 py-2 rounded-lg flex items-center ${loading || !isRoomAvailable() || (!selectedBed && isRoomAvailable()) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
              >
                {loading ? <div className="animate-spin h-4 w-4 mr-2 border-2 border-green-700 border-t-transparent rounded-full"></div> : <FaCheck className="mr-2" />}
                Approve Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoomChangeRequestDetailModal
