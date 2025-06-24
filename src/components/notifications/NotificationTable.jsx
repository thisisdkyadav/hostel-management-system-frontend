import React, { useState } from "react"
import { format } from "date-fns"
import ViewNotificationModal from "./ViewNotificationModal"
import BaseTable from "../common/table/BaseTable"

const NotificationTable = ({ notifications, onRefresh }) => {
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification)
    setShowViewModal(true)
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const getTargetAudience = (notification) => {
    const targets = []

    if (notification.hostelId && notification.hostelId.length > 0) {
      // Assuming hostelId is an array of objects like { _id: '...', name: '...' }
      targets.push(`Hostels: ${notification.hostelId.map((h) => h.name).join(", ")}`)
    }

    if (notification.department && notification.department.length > 0) {
      targets.push(`Depts: ${notification.department.join(", ")}`)
    }

    if (notification.degree && notification.degree.length > 0) {
      targets.push(`Degrees: ${notification.degree.join(", ")}`)
    }

    if (notification.gender) {
      targets.push(`Gender: ${notification.gender}`)
    }

    return targets.length > 0 ? targets.join(" | ") : "All Students"
  }

  const columns = [
    {
      header: "Title",
      key: "title",
      render: (notification) => (
        <div className="flex items-start flex-col">
          <div className="text-sm font-medium text-gray-900 mb-1">{notification.title}</div>
          <div className="text-xs text-gray-500">{getTargetAudience(notification)}</div>
        </div>
      ),
    },
    {
      header: "Created",
      key: "createdAt",
      render: (notification) => <span className="text-sm text-gray-500">{formatDate(notification.createdAt)}</span>,
    },
    {
      header: "Expires",
      key: "expiryDate",
      render: (notification) => <span className="text-sm text-gray-500">{formatDate(notification.expiryDate)}</span>,
    },
  ]

  return (
    <>
      <BaseTable columns={columns} data={notifications} emptyMessage="No notifications to display" onRowClick={handleViewNotification} />

      {showViewModal && <ViewNotificationModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} notification={selectedNotification} />}
    </>
  )
}

export default NotificationTable
