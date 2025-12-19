import React from "react"
import Modal from "../../common/Modal"
import { FiAlertTriangle } from "react-icons/fi"
import Button from "../../common/Button"

const DeleteAllAllocationsModal = ({ onClose, onConfirm, hostelName, isLoading }) => {
  return (
    <Modal onClose={onClose} title="Delete All Allocations" width={450}>
      <div style={{ padding: 'var(--spacing-4) 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-6)' }}>
          <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-full)' }}>
            <FiAlertTriangle size={32} />
          </div>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
          <p style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>CRITICAL WARNING</p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            This will remove <span style={{ fontWeight: 'var(--font-weight-bold)' }}>ALL</span> student room allocations from <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{hostelName}</span>.
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>All students will be immediately removed from their rooms.</p>
          <p style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-weight-semibold)' }}>This action CANNOT be undone.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)' }}>
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger" disabled={isLoading} isLoading={isLoading}>
            Delete All Allocations
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteAllAllocationsModal
