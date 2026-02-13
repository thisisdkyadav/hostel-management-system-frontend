import React from "react"
import { StatusBadge } from "czero/react"

const RoomStatusBadge = ({ status }) => {
  const getStatusType = () => {
    switch (status) {
      case "Active":
        return "success"
      case "Inactive":
        return "inactive"
      case "Maintenance":
        return "warning"
      case "Occupied":
        return "info"
      case "Reserved":
        return "purple"
      default:
        return "default"
    }
  }

  return <StatusBadge status={getStatusType()}>{status}</StatusBadge>
}

export default RoomStatusBadge
