import React from "react"
import { format } from "date-fns"
import { Grid, Heading, Text } from "@/components/ui"

const SecurityCheck = ({ checkInTime, checkOutTime }) => {
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A"

    const date = new Date(dateTimeString)
    return format(date, "MMM d, yyyy h:mm a")
  }

  return (
    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border-primary)' }}>
      <Heading as="h3" size="lg" weight="medium" color="primary" className="font-medium mb-3">Security Check Status</Heading>

      <Grid cols={{ base: 1, md: 2 }} gap={4}>
        <div>
          <Heading as="h4" size="sm" weight="medium" color="secondary" className="font-medium">Check-in Time</Heading>
          <div className="mt-1 flex items-center">
            <div className="rounded-full mr-2" style={{ width: 'var(--spacing-3)', height: 'var(--spacing-3)', backgroundColor: checkInTime ? 'var(--color-success)' : 'var(--color-bg-muted)' }} ></div>
            <Text size="sm" color="primary">{formatDateTime(checkInTime)}</Text>
          </div>
        </div>

        <div>
          <Heading as="h4" size="sm" weight="medium" color="secondary" className="font-medium">Check-out Time</Heading>
          <div className="mt-1 flex items-center">
            <div className="rounded-full mr-2" style={{ width: 'var(--spacing-3)', height: 'var(--spacing-3)', backgroundColor: checkOutTime ? 'var(--color-success)' : 'var(--color-bg-muted)' }} ></div>
            <Text size="sm" color="primary">{formatDateTime(checkOutTime)}</Text>
          </div>
        </div>
      </Grid>
    </div>
  )
}

export default SecurityCheck
