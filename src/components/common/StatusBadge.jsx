import React from "react"

const StatusBadge = ({ status }) => {
  const isCheckedIn = status === "Checked In"

  const baseClasses = "inline-block px-3 py-1 text-sm font-medium rounded-full"
  const statusClasses = isCheckedIn ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"

  return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>
}

export default StatusBadge
