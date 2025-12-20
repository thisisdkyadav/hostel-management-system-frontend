import React from "react"
import { FiAlertTriangle } from "react-icons/fi"
import Modal from "./Modal"

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed?", confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const renderFooter = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
        <button type="button" onClick={onClose} style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-body)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', border: 'none', cursor: 'pointer', transition: 'var(--transition-all)' }}>
          {cancelText}
        </button>
        <button type="button" onClick={handleConfirm} style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: isDestructive ? 'var(--color-danger)' : 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', border: 'none', cursor: 'pointer', transition: 'var(--transition-all)' }}>
          {confirmText}
        </button>
      </div>
    )
  }

  // If not open, don't render anything
  if (!isOpen) return null

  return (
    <Modal title={title} onClose={onClose} footer={renderFooter()} width={400}>
      <div style={{ padding: 'var(--spacing-4) 0' }}>
        {isDestructive && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-4)' }}>
            <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-danger-bg-light)', color: 'var(--color-danger)', borderRadius: 'var(--radius-full)' }}>
              <FiAlertTriangle size={24} />
            </div>
          </div>
        )}
        <p style={{ textAlign: 'center', color: 'var(--color-text-body)' }}>{message}</p>
      </div>
    </Modal>
  )
}

export default ConfirmationDialog
