import React from "react"
import { FaInfoCircle } from "react-icons/fa"
import { Text } from "@/components/ui"

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
      <Text as="div" color={statusStyles.color} style={{ backgroundColor: statusStyles.backgroundColor, borderColor: statusStyles.borderColor, padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', borderWidth: 'var(--border-1)' }} className="p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaInfoCircle className="mr-2" />
            <Text as="span" weight="medium" size="base">
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </div>
          <Text as="div" size="sm">Request ID: #{requestId?.substring(0, 8)}</Text>
        </div>
        {status === "Rejected" && rejectionReason && (
          <Text as="div" size="sm" style={{ marginTop: 'var(--spacing-2)' }} className="mt-2">
            <Text as="span" weight="medium">Reason for rejection:</Text> {rejectionReason}
          </Text>
        )}
        {/* {status === "Approved" && (
          <Text as="div" size="sm" style={{ marginTop: 'var(--spacing-2)' }} className="mt-2">
            <Text as="span" weight="medium">Approved on:</Text> {formatDate(approvedAt || new Date())}
          </Text>
        )} */}
      </Text>
    </>
  )
}

export default StatusBadge
