import React, { useState } from "react"
import { format } from "date-fns"
import ViewNotificationModal from "./ViewNotificationModal"
import { DataTable } from "czero/react"

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
        <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>{notification.title}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{getTargetAudience(notification)}</div>
        </div>
      ),
    },
    {
      header: "Created",
      key: "createdAt",
      render: (notification) => <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{formatDate(notification.createdAt)}</span>,
    },
    {
      header: "Expires",
      key: "expiryDate",
      render: (notification) => <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{formatDate(notification.expiryDate)}</span>,
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={notifications} emptyMessage="No notifications to display" onRowClick={handleViewNotification} />

      {showViewModal && <ViewNotificationModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} notification={selectedNotification} />}
    </>
  )
}

export default NotificationTable
