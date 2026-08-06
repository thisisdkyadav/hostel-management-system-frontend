import React from "react"
import { FaUser } from "react-icons/fa"
import { Surface, Text } from "@/components/ui"

const VisitorInformation = ({ visitors }) => {
  return (
    <div>
      <h3 className="font-medium mb-3 flex items-center" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', fontSize: 'var(--font-size-base)' }}>
        <FaUser className="mr-2" style={{ color: 'var(--color-primary)' }} /> Visitor Information
      </h3>
      <div className="space-y-3">
        {visitors.map((visitor, index) => (
          <Surface bg="tertiary" padding={4} radius="lg" key={index} className="p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)' }}>{visitor.name}</h4>
                <Text size="sm" color="muted">Relation: {visitor.relation}</Text>
              </div>
              <div className="flex flex-col items-start sm:items-end">
                <Text as="span" size="sm" color="muted">{visitor.phone}</Text>
                <Text as="span" size="sm" color="muted">{visitor.email}</Text>
              </div>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  )
}

export default VisitorInformation
