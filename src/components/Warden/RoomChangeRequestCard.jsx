import React from "react"
import { FaExchangeAlt, FaArrowRight, FaCalendarAlt } from "react-icons/fa"

const RoomChangeRequestCard = ({ request, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "approved":
        return "bg-green-50 text-green-700 border-green-200"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case "approved":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>
      case "rejected":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>
    }
  }

  return (
    <div className={`border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${getStatusColor(request.status)}`} onClick={onClick}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
              <FaExchangeAlt size={20} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold">{request.student?.fullName}</h3>
              <p className="text-sm text-gray-600">{request.student?.email}</p>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>

        <div className="bg-white rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-500">Current Room</p>
              <p className="font-medium">Room {request.currentRoom?.roomNumber}</p>
              <p className="text-xs text-gray-500">{request.currentRoom?.hostel}</p>
            </div>
            <FaArrowRight className="text-gray-400 mx-2" />
            <div>
              <p className="text-xs text-gray-500">Requested Room</p>
              <p className="font-medium">Room {request.requestedRoom?.roomNumber}</p>
              <p className="text-xs text-gray-500">{request.requestedRoom?.hostel}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <FaCalendarAlt className="mr-2" />
          <span>Requested on {new Date(request.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-4">
          {request.reason && (
            <div className="mb-3">
              <p className="text-xs text-gray-500">Reason:</p>
              <p className="text-sm">{request.reason}</p>
            </div>
          )}
          <button className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">View Details</button>
        </div>
      </div>
    </div>
  )
}

export default RoomChangeRequestCard
