import React from "react"
import { FaEye, FaExchangeAlt, FaArrowRight, FaCalendarAlt } from "react-icons/fa"

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
      case "Pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case "Approved":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>
      case "Rejected":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <FaExchangeAlt className="text-[#1360AB]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base md:text-lg line-clamp-1">{request.student?.fullName || request.student?.name || "Unknown Student"}</h3>
            <span className="text-xs text-gray-500">{request.student?.email || "No email"}</span>
          </div>
        </div>
        <div>
          {request.status === "pending" && <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
          {request.status === "approved" && <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>}
          {request.status === "rejected" && <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Current Room</p>
            <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
              <p className="font-medium text-sm">{request.currentRoom?.roomNumber || "N/A"}</p>
              <p className="text-xs text-gray-500">{request.currentRoom?.hostel || ""}</p>
            </div>
          </div>
          <FaArrowRight className="text-gray-400" />
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Requested Room</p>
            <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
              <p className="font-medium text-sm">{request.requestedRoom?.roomNumber || "N/A"}</p>
              <p className="text-xs text-gray-500">{request.requestedRoom?.hostel || ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center text-gray-500 text-xs mb-3">
        <FaCalendarAlt className="mr-2 text-[#1360AB]" />
        <span>Requested on {new Date(request.createdAt).toLocaleDateString()}</span>
      </div>

      {request.reason && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg text-sm">
          <p className="text-xs text-blue-700 font-medium mb-1">Reason:</p>
          <p className="text-gray-700 line-clamp-2">{request.reason}</p>
        </div>
      )}

      <button
        className="w-full py-2.5 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300 text-sm font-medium flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation()
          onClick(request)
        }}
      >
        <FaEye className="mr-2" /> View Details
      </button>
    </div>
  )
}

export default RoomChangeRequestCard
