import React from "react"
import { FaCalendarAlt } from "react-icons/fa"
import { Text } from "@/components/ui"

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
          <Text as="span" color="muted" size="sm">From Date:</Text>
          <Text as="span" weight="medium" size="sm" color="primary">{formatDate(fromDate)}</Text>
        </div>
        <div className="flex justify-between">
          <Text as="span" color="muted" size="sm">To Date:</Text>
          <Text as="span" weight="medium" size="sm" color="primary">{formatDate(toDate)}</Text>
        </div>
        <div className="flex justify-between">
          <Text as="span" color="muted" size="sm">Duration:</Text>
          <Text as="span" weight="medium" size="sm" color="primary">{calculateDuration(fromDate, toDate)} days</Text>
        </div>
      </div>
    </div>
  )
}

export default VisitInformation
