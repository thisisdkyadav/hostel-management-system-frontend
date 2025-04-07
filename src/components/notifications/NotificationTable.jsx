import React, { useState } from "react"
import { FaEye } from "react-icons/fa"
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

    if (notification.hostelId) {
      targets.push(`Hostel: ${notification.hostelId.name}`)
    }

    if (notification.department) {
      targets.push(`Dept: ${notification.department}`)
    }

    if (notification.degree) {
      targets.push(`${notification.degree}`)
    }

    if (notification.gender) {
      targets.push(`${notification.gender}`)
    }

    return targets.length > 0 ? targets.join(", ") : "All Students"
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
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (notification) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => handleViewNotification(notification)} className="text-blue-600 hover:text-blue-900 p-1" title="View">
            <FaEye />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <BaseTable columns={columns} data={notifications} emptyMessage="No notifications to display" />

      {showViewModal && <ViewNotificationModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} notification={selectedNotification} />}
    </>
  )
}

export default NotificationTable
