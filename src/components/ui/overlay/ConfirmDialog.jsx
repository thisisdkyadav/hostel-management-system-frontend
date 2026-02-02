import React from "react"
import { FiAlertTriangle } from "react-icons/fi"
import Modal from "@/components/ui/feedback/Modal"
import { Button } from "czero/react"

/**
 * ConfirmDialog Component - Matches existing design language
 * 
 * @param {boolean} isOpen - Dialog visibility
 * @param {function} onClose - Close/cancel handler
 * @param {function} onConfirm - Confirm handler
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {boolean} isDestructive - Show danger styling
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const renderFooter = () => {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)" }}>
        <Button type="button" onClick={onClose} variant="secondary" size="md">
          {cancelText}
        </Button>
        <Button type="button" onClick={handleConfirm} variant={isDestructive ? "danger" : "primary"} size="md">
          {confirmText}
        </Button>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <Modal title={title} onClose={onClose} footer={renderFooter()} width={400}>
      <div style={{ padding: "var(--spacing-4) 0" }}>
        {isDestructive && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--spacing-4)" }}>
            <div
              style={{
                padding: "var(--spacing-3)",
                backgroundColor: "var(--color-danger-bg-light)",
                color: "var(--color-danger)",
                borderRadius: "var(--radius-full)",
              }}
            >
              <FiAlertTriangle size={24} />
            </div>
          </div>
        )}
        <p style={{ textAlign: "center", color: "var(--color-text-body)" }}>{message}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
