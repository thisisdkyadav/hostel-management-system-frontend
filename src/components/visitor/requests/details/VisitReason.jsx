import React from "react"

const VisitReason = ({ reason, approvalInformation, isApproved }) => {
  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
      <h3 className="font-medium mb-3" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', fontSize: 'var(--font-size-base)' }}>Reason for Visit</h3>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{reason}</p>

      {isApproved && approvalInformation && (
        <div className="mt-4" style={{ marginTop: 'var(--spacing-4)' }}>
          <h4 className="font-medium mb-1" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-success-text)', marginBottom: 'var(--spacing-1)' }}>Approval Information</h4>
          <p className="whitespace-pre-line" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{approvalInformation}</p>
        </div>
      )}
    </div>
  )
}

export default VisitReason
