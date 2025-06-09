import React, { useState } from "react"
import { FaEye, FaHome, FaSignInAlt, FaSignOutAlt, FaClock } from "react-icons/fa"
import VisitorRequestDetailsModal from "./VisitorRequestDetailsModal"
import { visitorApi } from "../../../services/visitorApi"
import { useAuth } from "../../../contexts/AuthProvider"
import BaseTable from "../../common/table/BaseTable"

const StatusBadge = ({ status }) => {
  const statusMap = {
    Pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    Approved: { color: "bg-green-100 text-green-800", label: "Approved" },
    Rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    Completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
  }
  const { color, label } = statusMap[status] || statusMap.Pending
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
}

const AllocationBadge = ({ request }) => {
  const isAllocated = request.isAllocated
  return isAllocated ? <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Allocated</span> : <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unallocated</span>
}

const CheckInOutBadge = ({ request }) => {
  const hasCheckedIn = request.checkInTime
  const hasCheckedOut = request.checkOutTime

  if (hasCheckedOut) return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Checked Out</span>
  if (hasCheckedIn) return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Checked In</span>
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Checked</span>
}

const VisitorRequestTable = ({ requests, onRefresh }) => {
  const { user } = useAuth()
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleViewDetails = (request) => {
    setSelectedRequestId(request._id)
    setShowDetails(true)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const columns = [
    {
      header: "Request ID and Student Details",
      key: "studentDetails",
      render: (request) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-xs text-gray-500 mb-1 block">#{request._id.substring(0, 8)}</span>
            <div className="flex items-center">
              {request.studentProfileImage ? (
                <img className="h-10 w-10 rounded-full object-cover" src={request.studentProfileImage} alt={request.studentName} />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">{request.studentName?.charAt(0) || "?"}</div>
              )}
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{request.studentName || "N/A"}</div>
                <div className="text-xs text-gray-500">{request.studentEmail || "No email"}</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Visitors",
      key: "visitors",
      render: (request) => (
        <div>
          <div className="text-sm text-gray-900">
            {request.visitorCount} visitor{request.visitorCount !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-gray-500">{request.visitorNames}</div>
        </div>
      ),
    },
    {
      header: "From Date",
      key: "fromDate",
      render: (request) => <div className="text-sm text-gray-900">{formatDate(request.fromDate)}</div>,
    },
    {
      header: "To Date",
      key: "toDate",
      render: (request) => <div className="text-sm text-gray-900">{formatDate(request.toDate)}</div>,
    },
    {
      header: "Status",
      key: "status",
      render: (request) => <StatusBadge status={request.status} />,
    },
    {
      header: ["Security", "Hostel Gate"].includes(user.role) ? "Check Status" : "Allocation",
      key: "checkStatus",
      render: (request) => (["Security", "Hostel Gate"].includes(user.role) ? <CheckInOutBadge request={request} /> : <AllocationBadge request={request} />),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (request) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => handleViewDetails(request)} className="text-[#1360AB] hover:text-blue-700 p-1 rounded-full transition-colors" title="View details">
            <FaEye className="h-4 w-4" />
          </button>

          {["Warden", "Associate Warden", "Hostel Supervisor"].includes(user.role) && request.status === "Approved" && !request.isAllocated && (
            <button onClick={() => handleViewDetails(request)} className="text-green-500 hover:text-green-700 p-1 rounded-full transition-colors" title="Allocate rooms">
              <FaHome className="h-4 w-4" />
            </button>
          )}

          {["Security", "Hostel Gate"].includes(user.role) && request.status === "Approved" && request.isAllocated && (
            <>
              {!request.checkInTime && (
                <button onClick={() => handleViewDetails(request)} className="text-blue-500 hover:text-blue-700 p-1 rounded-full transition-colors" title="Check in visitor">
                  <FaSignInAlt className="h-4 w-4" />
                </button>
              )}
              {request.checkInTime && !request.checkOutTime && (
                <button onClick={() => handleViewDetails(request)} className="text-green-500 hover:text-green-700 p-1 rounded-full transition-colors" title="Check out visitor">
                  <FaSignOutAlt className="h-4 w-4" />
                </button>
              )}
              {request.checkInTime && (
                <button onClick={() => handleViewDetails(request)} className="text-yellow-500 hover:text-yellow-700 p-1 rounded-full transition-colors" title="Edit check times">
                  <FaClock className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ]

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">No requests found matching your filters.</p>
      </div>
    )
  }

  return (
    <>
      <BaseTable columns={columns} data={requests} emptyMessage="No visitor requests to display" />

      {selectedRequestId && (
        <VisitorRequestDetailsModal
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false)
            setSelectedRequestId(null)
          }}
          requestId={selectedRequestId}
          onRefresh={onRefresh}
        />
      )}
    </>
  )
}

export default VisitorRequestTable
