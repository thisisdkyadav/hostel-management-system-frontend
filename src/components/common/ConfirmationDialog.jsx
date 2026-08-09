import React from "react"
import { FiAlertTriangle } from "react-icons/fi"
import { Button, HStack, Modal, Surface, Text } from "hzero"

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed?", confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const renderFooter = () => {
    return (
      <>
        <Button type="button" onClick={onClose} variant="secondary" size="md">
          {cancelText}
        </Button>
        <Button type="button" onClick={handleConfirm} variant={isDestructive ? "danger" : "primary"} size="md">
          {confirmText}
        </Button>
      </>
    )
  }

  // If not open, don't render anything
  if (!isOpen) return null

  return (
    <Modal title={title} onClose={onClose} footer={renderFooter()} width={400}>
      <Surface padding="var(--spacing-4) 0">
        {isDestructive && (
          <HStack gap="none" justify="center" style={{ marginBottom: 'var(--spacing-4)' }}>
            <Text as="div" color="danger" style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-danger-bg-light)', borderRadius: 'var(--radius-full)' }}>
              <FiAlertTriangle size={24} />
            </Text>
          </HStack>
        )}
        <Text align="center" color="body">{message}</Text>
      </Surface>
    </Modal>
  )
}

export default ConfirmationDialog
