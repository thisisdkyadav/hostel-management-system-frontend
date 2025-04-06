import React from "react"

const RoomStatusBadge = ({ status }) => {
  const getBadgeStyles = () => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-gray-100 text-gray-800"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "Occupied":
        return "bg-blue-100 text-blue-800"
      case "Reserved":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyles()}`}>{status}</span>
}

export default RoomStatusBadge
