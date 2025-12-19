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

  const getStatusStyles = (status) => {
    if (!status) return {
      backgroundColor: 'var(--color-bg-muted)',
      color: 'var(--color-text-secondary)',
      borderColor: 'var(--color-border-primary)'
    }

    const statusStyles = {
      Pending: {
        backgroundColor: 'var(--color-warning-bg)',
        color: 'var(--color-warning-text)',
        borderColor: 'var(--color-warning-bg)'
      },
      Approved: {
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success-text)',
        borderColor: 'var(--color-success-bg)'
      },
      Rejected: {
        backgroundColor: 'var(--color-danger-bg)',
        color: 'var(--color-danger-text)',
        borderColor: 'var(--color-danger-border)'
      },
      Completed: {
        backgroundColor: 'var(--color-info-bg)',
        color: 'var(--color-info-text)',
        borderColor: 'var(--color-info-bg)'
      },
    }
    return statusStyles[status] || statusStyles.Pending
  }

  const statusStyles = getStatusStyles(status)

  return (
    <>
      <div className="p-4 rounded-lg border" style={{ backgroundColor: statusStyles.backgroundColor, color: statusStyles.color, borderColor: statusStyles.borderColor, padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', borderWidth: 'var(--border-1)' }} >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaInfoCircle className="mr-2" />
            <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)' }}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)' }}>Request ID: #{requestId?.substring(0, 8)}</div>
        </div>
        {status === "Rejected" && rejectionReason && (
          <div className="mt-2" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-2)' }}>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Reason for rejection:</span> {rejectionReason}
          </div>
        )}
        {/* {status === "Approved" && (
          <div className="mt-2" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-2)' }}>
            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Approved on:</span> {formatDate(approvedAt || new Date())}
          </div>
        )} */}
      </div>
    </>
  )
}

export default StatusBadge
