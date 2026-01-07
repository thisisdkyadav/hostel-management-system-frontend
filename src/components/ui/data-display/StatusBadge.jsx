import React from "react"

/**
 * StatusBadge Component - Matches existing design language
 * 
 * @param {string} status - Status text to display
 */
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Checked In":
      case "Active":
      case "Present":
        return {
          bg: "bg-[var(--color-success-bg-light)]",
          text: "text-[var(--color-success-dark)]",
          dot: "bg-[var(--color-success)]"
        }
      case "Checked Out":
      case "Inactive":
      case "Absent":
        return {
          bg: "bg-[var(--color-danger-bg-light)]",
          text: "text-[var(--color-danger-dark)]",
          dot: "bg-[var(--color-danger)]"
        }
      case "Maintenance":
      case "Pending":
        return {
          bg: "bg-[var(--color-warning-bg-light)]",
          text: "text-[var(--color-warning-dark)]",
          dot: "bg-[var(--color-warning)]"
        }
      default:
        return {
          bg: "bg-[var(--color-primary-bg)]",
          text: "text-[var(--color-primary-dark)]",
          dot: "bg-[var(--color-primary)]"
        }
    }
  }

  const styles = getStatusStyles()

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-1.5 ${styles.dot}`}
      ></span>
      {status}
    </span>
  )
}

export default StatusBadge
