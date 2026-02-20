import React, { useState } from "react"
import { FaEye, FaHome, FaSignInAlt, FaSignOutAlt, FaClock } from "react-icons/fa"
import VisitorRequestDetailsModal from "./VisitorRequestDetailsModal"
import { visitorApi } from "../../../service"
import { useAuth } from "../../../contexts/AuthProvider"
import { Button, DataTable } from "czero/react"
import { getMediaUrl } from "../../../utils/mediaUtils"
const StatusBadge = ({ status }) => {
  const statusMap = {
    Pending: { bgColor: "var(--color-warning-bg)", textColor: "var(--color-warning-text)", label: "Pending" },
    Approved: { bgColor: "var(--color-success-bg)", textColor: "var(--color-success-text)", label: "Approved" },
    Rejected: { bgColor: "var(--color-danger-bg)", textColor: "var(--color-danger-text)", label: "Rejected" },
    Completed: { bgColor: "var(--color-info-bg)", textColor: "var(--color-info-text)", label: "Completed" },
  }
  const { bgColor, textColor, label } = statusMap[status] || statusMap.Pending
  return <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: bgColor, color: textColor }}>{label}</span>
}

const AllocationBadge = ({ request }) => {
  const isAllocated = request.isAllocated
  return isAllocated ? (
    <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-info-bg)", color: "var(--color-info-text)" }}>Allocated</span>
  ) : (
    <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-secondary)" }}>Unallocated</span>
  )
}

const CheckInOutBadge = ({ request }) => {
  const hasCheckedIn = request.checkInTime
  const hasCheckedOut = request.checkOutTime

  if (hasCheckedOut) return <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-purple-light-bg)", color: "var(--color-purple-text)" }}>Checked Out</span>
  if (hasCheckedIn) return <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-info-bg)", color: "var(--color-info-text)" }}>Checked In</span>
  return <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-secondary)" }}>Not Checked</span>
}

const VisitorRequestTable = ({ requests, onRefresh }) => {
  const { user } = useAuth()
  const canAllocateVisitors =
    ["Warden", "Associate Warden", "Hostel Supervisor"].includes(user?.role) &&
    true
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: "0" }}>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: "var(--spacing-1)", display: "block" }}>#{request._id.substring(0, 8)}</span>
            <div style={{ display: "flex", alignItems: "center" }}>
              {request.studentProfileImage ? (
                <img style={{ height: "var(--avatar-md)", width: "var(--avatar-md)", borderRadius: "var(--radius-full)", objectFit: "cover" }} src={getMediaUrl(request.studentProfileImage)} alt={request.studentName} />
              ) : (
                <div style={{ height: "var(--avatar-md)", width: "var(--avatar-md)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
                  {request.studentName?.charAt(0) || "?"}
                </div>
              )}
              <div style={{ marginLeft: "var(--spacing-3)" }}>
                <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{request.studentName || "N/A"}</div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{request.studentEmail || "No email"}</div>
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
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-primary)" }}>
            {request.visitorCount} visitor{request.visitorCount !== 1 ? "s" : ""}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{request.visitorNames}</div>
        </div>
      ),
    },
    {
      header: "From Date",
      key: "fromDate",
      render: (request) => <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-primary)" }}>{formatDate(request.fromDate)}</div>,
    },
    {
      header: "To Date",
      key: "toDate",
      render: (request) => <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-primary)" }}>{formatDate(request.toDate)}</div>,
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
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
          <Button onClick={() => handleViewDetails(request)} variant="ghost" size="sm" aria-label="View details">
            <FaEye />
          </Button>

          {canAllocateVisitors && request.status === "Approved" && !request.isAllocated && (
            <Button onClick={() => handleViewDetails(request)} variant="ghost" size="sm" aria-label="Allocate rooms">
              <FaHome />
            </Button>
          )}

          {["Security", "Hostel Gate"].includes(user.role) && request.status === "Approved" && request.isAllocated && (
            <>
              {!request.checkInTime && <Button onClick={() => handleViewDetails(request)} variant="ghost" size="sm" aria-label="Check in visitor"><FaSignInAlt /></Button>}
              {request.checkInTime && !request.checkOutTime && <Button onClick={() => handleViewDetails(request)} variant="ghost" size="sm" aria-label="Check out visitor"><FaSignOutAlt /></Button>}
              {request.checkInTime && <Button onClick={() => handleViewDetails(request)} variant="ghost" size="sm" aria-label="Edit check times"><FaClock /></Button>}
            </>
          )}
        </div>
      ),
    },
  ]

  if (!requests || requests.length === 0) {
    return (
      <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-sm)", padding: "var(--spacing-8)", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-base)" }}>No requests found matching your filters.</p>
      </div>
    )
  }

  return (
    <>
      <DataTable columns={columns} data={requests} emptyMessage="No visitor requests to display" />

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
