import React from "react"

const StatusBadge = ({ status }) => {
  const isCheckedIn = status === "Checked In"

  const baseClasses = "inline-block px-3 py-1 text-sm font-medium rounded-full"
  const statusClasses = isCheckedIn ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  return (
    <span className={` inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isCheckedIn ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} `} >
      <span className={`w-2 h-2 rounded-full mr-1.5 ${isCheckedIn ? "bg-green-500" : "bg-red-500"}`}></span>
      {status}
    </span>
  )
}

export default StatusBadge
