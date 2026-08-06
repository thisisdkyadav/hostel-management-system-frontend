import React from "react"
import { FaUser } from "react-icons/fa"
import { Heading, Surface, Text } from "@/components/ui"

const VisitorInformation = ({ visitors }) => {
  return (
    <div>
      <Heading as="h3" weight="medium" color="secondary" size="base" style={{ marginBottom: 'var(--spacing-3)' }} className="font-medium mb-3 flex items-center">
        <FaUser className="mr-2" color="var(--color-primary)" /> Visitor Information
      </Heading>
      <div className="space-y-3">
        {visitors.map((visitor, index) => (
          <Surface bg="tertiary" padding={4} radius="lg" key={index} className="p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <Heading as="h4" weight="medium" color="primary" size="base">{visitor.name}</Heading>
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
