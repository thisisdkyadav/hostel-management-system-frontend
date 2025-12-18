import React from "react"
import { FaUser } from "react-icons/fa"

const VisitorInformation = ({ visitors }) => {
  return (
    <div>
      <h3 className="font-medium mb-3 flex items-center" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', fontSize: 'var(--font-size-base)' }}>
        <FaUser className="mr-2" style={{ color: 'var(--color-primary)' }} /> Visitor Information
      </h3>
      <div className="space-y-3">
        {visitors.map((visitor, index) => (
          <div key={index} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)' }}>{visitor.name}</h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Relation: {visitor.relation}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{visitor.phone}</span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{visitor.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VisitorInformation
