import React from "react"
import { Button } from "czero/react"
import { Heading, HStack } from "@/components/ui"

const RejectionForm = ({ rejectionReason, onReasonChange, onCancel, onSubmit }) => {
  return (
    <div style={{ backgroundColor: 'var(--color-danger-bg-light)', border: `var(--border-1) solid var(--color-danger-border)`, padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', animation: 'fadeIn 0.3s ease-in-out' }}>
      <Heading as="h3" weight="medium" color="danger-text" size="base" style={{ marginBottom: 'var(--spacing-3)' }}>Reject Visitor Request</Heading>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <label htmlFor="rejection-reason" style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>
          Reason for Rejection (Optional)
        </label>
        <textarea id="rejection-reason" value={rejectionReason} onChange={(e) => onReasonChange(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--spacing-2)',
            border: `var(--border-1) solid var(--color-border-input)`,
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-base)',
            outline: 'none',
            transition: 'var(--transition-colors)',
            resize: 'vertical'
          }}
          rows="3"
          placeholder="Please provide an optional reason for rejection"
          onFocus={(e) => {
            e.target.style.boxShadow = 'var(--input-focus-ring)'
            e.target.style.borderColor = 'var(--color-border-focus)'
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none'
            e.target.style.borderColor = 'var(--color-border-input)'
          }}
        ></textarea>
      </div>
      <HStack gap={2} justify="end">
        <Button onClick={onCancel} variant="secondary" size="md">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="danger" size="md">
          Confirm Rejection
        </Button>
      </HStack>
    </div>
  )
}

export default RejectionForm
