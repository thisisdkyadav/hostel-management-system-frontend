import React, { useState } from "react"
import { FaEye, FaTimes, FaEdit } from "react-icons/fa"
import VisitorRequestDetailsModal from "./VisitorRequestDetailsModal"
import EditVisitorRequestModal from "./EditVisitorRequestModal"
import { visitorApi } from "../../../services/visitorApi"
import { useAuth } from "../../../contexts/AuthProvider"

const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    approved: { color: "bg-green-100 text-green-800", label: "Approved" },
    rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
  }

  const { color, label } = statusMap[status.toLowerCase()] || statusMap.pending

  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
}

const VisitorRequestTable = ({ requests, onRefresh }) => {
  const { user } = useAuth()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetails(true)
  }

  const handleEditRequest = (request) => {
    setSelectedRequest(request)
    setShowEditModal(true)
  }

  const handleCancelRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      try {
        await visitorApi.cancelVisitorRequest(requestId)
        onRefresh()
      } catch (error) {
        console.error("Error canceling request:", error)
        alert("Failed to cancel request. Please try again.")
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">No requests found matching your filters.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitors
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{request._id.substring(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.visitors.length} visitor{request.visitors.length !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-gray-500">{request.visitors.map((v) => v.name).join(", ")}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(request.fromDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(request.toDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleViewDetails(request)} className="text-[#1360AB] hover:text-blue-700 p-1 rounded-full transition-colors" title="View details">
                      <FaEye className="h-4 w-4" />
                    </button>

                    {["Student"].includes(user.role) && request.status.toLowerCase() === "pending" && (
                      <>
                        <button onClick={() => handleEditRequest(request)} className="text-amber-500 hover:text-amber-700 p-1 rounded-full transition-colors ml-2" title="Edit request">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleCancelRequest(request._id)} className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors ml-2" title="Cancel request">
                          <FaTimes className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <>
          <VisitorRequestDetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} request={selectedRequest} onRefresh={onRefresh} />

          <EditVisitorRequestModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} request={selectedRequest} onRefresh={onRefresh} />
        </>
      )}
    </>
  )
}

export default VisitorRequestTable
