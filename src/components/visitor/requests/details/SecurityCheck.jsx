import React from "react"
import { format } from "date-fns"

const SecurityCheck = ({ checkInTime, checkOutTime }) => {
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A"

    const date = new Date(dateTimeString)
    return format(date, "MMM d, yyyy h:mm a")
  }

  return (
    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border-primary)' }}>
      <h3 className="font-medium mb-3" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>Security Check Status</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Check-in Time</h4>
          <div className="mt-1 flex items-center">
            <div className="rounded-full mr-2" style={{ width: 'var(--spacing-3)', height: 'var(--spacing-3)', backgroundColor: checkInTime ? 'var(--color-success)' : 'var(--color-bg-muted)' }} ></div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{formatDateTime(checkInTime)}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Check-out Time</h4>
          <div className="mt-1 flex items-center">
            <div className="rounded-full mr-2" style={{ width: 'var(--spacing-3)', height: 'var(--spacing-3)', backgroundColor: checkOutTime ? 'var(--color-success)' : 'var(--color-bg-muted)' }} ></div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{formatDateTime(checkOutTime)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityCheck
