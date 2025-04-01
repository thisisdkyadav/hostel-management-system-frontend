import React from "react"
import { FaInfoCircle } from "react-icons/fa"

const StatusBadge = ({ status, rejectionReason, approvedAt, requestId }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200"

    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Approved: "bg-green-100 text-green-800 border-green-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
      Completed: "bg-blue-100 text-blue-800 border-blue-200",
    }
    return statusColors[status] || statusColors.Pending
  }

  return (
    <>
      <div className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaInfoCircle className="mr-2" />
            <span className="font-medium">Status: {status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </div>
          <div className="text-sm">Request ID: #{requestId?.substring(0, 8)}</div>
        </div>
        {status === "Rejected" && rejectionReason && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Reason for rejection:</span> {rejectionReason}
          </div>
        )}
        {status === "Approved" && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Approved on:</span> {formatDate(approvedAt || new Date())}
          </div>
        )}
      </div>
    </>
  )
}

export default StatusBadge
