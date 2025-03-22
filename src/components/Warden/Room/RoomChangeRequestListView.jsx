import React from "react"
import { FaExchangeAlt, FaEye } from "react-icons/fa"
import RoomChangeRequestCard from "./RoomChangeRequestCard"

const RoomChangeRequestListView = ({ requests, viewMode, onRequestClick }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case "Approved":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
      case "Rejected":
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>
    }
  }

  if (viewMode === "table") {
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Requested</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">{request.student?.name?.charAt(0) || "S"}</div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{request.student?.name}</div>
                      <div className="text-sm text-gray-500">{request.student?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Room {request.currentRoom?.unitNumber} ({request.currentRoom?.roomNumber})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Room {request.requestedRoom?.unitNumber} ({request.requestedRoom?.roomNumber})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => onRequestClick(request)} className="text-indigo-600 hover:text-indigo-900 p-1" title="View Details">
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((request) => (
        <RoomChangeRequestCard key={request.id} request={request} onClick={() => onRequestClick(request)} />
      ))}
    </div>
  )
}

export default RoomChangeRequestListView
