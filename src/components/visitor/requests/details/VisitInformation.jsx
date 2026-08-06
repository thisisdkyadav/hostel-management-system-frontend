import React from "react"
import { FaCalendarAlt } from "react-icons/fa"
import { Heading, Surface, Text } from "@/components/ui"

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
    <Surface bg="tertiary" padding={4} radius="lg" className="p-4 rounded-lg">
      <Heading as="h3" weight="medium" color="secondary" size="base" style={{ marginBottom: 'var(--spacing-3)' }} className="font-medium mb-3 flex items-center">
        <FaCalendarAlt className="mr-2" color="var(--color-primary)" /> Visit Information
      </Heading>
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
    </Surface>
  )
}

export default VisitInformation
