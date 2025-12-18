import React from "react"

const RejectionForm = ({ rejectionReason, onReasonChange, onCancel, onSubmit }) => {
  return (
    <div style={{
      backgroundColor: 'var(--color-danger-bg-light)',
      border: `var(--border-1) solid var(--color-danger-border)`,
      padding: 'var(--spacing-4)',
      borderRadius: 'var(--radius-lg)',
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      <h3 style={{
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-danger-text)',
        marginBottom: 'var(--spacing-3)',
        fontSize: 'var(--font-size-base)'
      }}>Reject Visitor Request</h3>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <label htmlFor="rejection-reason" style={{
          display: 'block',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-body)',
          marginBottom: 'var(--spacing-1)'
        }}>
          Reason for Rejection (Optional)
        </label>
        <textarea
          id="rejection-reason"
          value={rejectionReason}
          onChange={(e) => onReasonChange(e.target.value)}
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
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--spacing-2)'
      }}>
        <button onClick={onCancel} style={{
          padding: 'var(--spacing-2) var(--spacing-4)',
          backgroundColor: 'var(--color-bg-muted)',
          color: 'var(--color-text-body)',
          borderRadius: 'var(--radius-lg)',
          border: 'none',
          cursor: 'pointer',
          transition: 'var(--transition-colors)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-medium)'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}>
          Cancel
        </button>
        <button onClick={onSubmit} style={{
          padding: 'var(--spacing-2) var(--spacing-4)',
          backgroundColor: 'var(--color-danger)',
          color: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          border: 'none',
          cursor: 'pointer',
          transition: 'var(--transition-colors)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-medium)'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-danger-hover)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-danger)'}>
          Confirm Rejection
        </button>
      </div>
    </div>
  )
}

export default RejectionForm
