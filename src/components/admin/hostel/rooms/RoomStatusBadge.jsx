import React from "react"

const RoomStatusBadge = ({ status }) => {
  const getBadgeStyles = () => {
    switch (status) {
      case "Active":
        return { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }
      case "Inactive":
        return { backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }
      case "Maintenance":
        return { backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' }
      case "Occupied":
        return { backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info-text)' }
      case "Reserved":
        return { backgroundColor: 'var(--color-purple-light-bg)', color: 'var(--color-purple-text)' }
      default:
        return { backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }
    }
  }

  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--spacing-0-5) var(--spacing-2-5)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', ...getBadgeStyles() }}>{status}</span>
}

export default RoomStatusBadge
