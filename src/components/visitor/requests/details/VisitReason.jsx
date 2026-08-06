import React from "react"
import { Heading, Surface, Text } from "@/components/ui"

const VisitReason = ({ reason, approvalInformation, isApproved }) => {
  return (
    <Surface bg="tertiary" padding={4} radius="lg" className="p-4 rounded-lg">
      <Heading as="h3" weight="medium" color="secondary" size="base" style={{ marginBottom: 'var(--spacing-3)' }} className="font-medium mb-3">Reason for Visit</Heading>
      <Text size="sm" color="muted">{reason}</Text>

      {isApproved && approvalInformation && (
        <div className="mt-4" style={{ marginTop: 'var(--spacing-4)' }}>
          <Heading as="h4" size="sm" weight="medium" color="success-text" style={{ marginBottom: 'var(--spacing-1)' }} className="font-medium mb-1">Approval Information</Heading>
          <Text size="sm" color="secondary" className="whitespace-pre-line">{approvalInformation}</Text>
        </div>
      )}
    </Surface>
  )
}

export default VisitReason
