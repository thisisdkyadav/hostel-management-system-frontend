import React from "react"

/**
 * StatusBadge Component - Matches existing design language
 * 
 * @param {string} status - Status text to display
 */
const StatusBadge = ({ status }) => {
  const isCheckedIn = status === "Checked In"

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isCheckedIn
          ? "bg-[var(--color-success-bg-light)] text-[var(--color-success-dark)]"
          : "bg-[var(--color-danger-bg-light)] text-[var(--color-danger-dark)]"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-1.5 ${
          isCheckedIn ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"
        }`}
      ></span>
      {status}
    </span>
  )
}

export default StatusBadge
