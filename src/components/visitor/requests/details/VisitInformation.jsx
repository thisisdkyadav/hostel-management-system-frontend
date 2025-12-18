import React from "react"
import { FaCalendarAlt } from "react-icons/fa"

const VisitInformation = ({ fromDate, toDate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateDuration = (from, to) => {
    return Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
      <h3 className="font-medium mb-3 flex items-center" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', fontSize: 'var(--font-size-base)' }}>
        <FaCalendarAlt className="mr-2" style={{ color: 'var(--color-primary)' }} /> Visit Information
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>From Date:</span>
          <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{formatDate(fromDate)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>To Date:</span>
          <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{formatDate(toDate)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Duration:</span>
          <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{calculateDuration(fromDate, toDate)} days</span>
        </div>
      </div>
    </div>
  )
}

export default VisitInformation
