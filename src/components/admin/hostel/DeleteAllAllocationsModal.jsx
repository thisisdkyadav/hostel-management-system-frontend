import React from "react"
import { Modal, Button, VStack, HStack } from "@/components/ui"
import { TriangleAlert } from "lucide-react"

const DeleteAllAllocationsModal = ({ onClose, onConfirm, hostelName, isLoading }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Delete All Allocations" width={450}>
      <VStack gap="large" style={{ padding: 'var(--spacing-4) 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-full)' }}>
            <TriangleAlert size={32} />
          </div>
        </div>

        <VStack gap="medium" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>CRITICAL WARNING</p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            This will remove <span style={{ fontWeight: 'var(--font-weight-bold)' }}>ALL</span> student room allocations from <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{hostelName}</span>.
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>All students will be immediately removed from their rooms.</p>
          <p style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-weight-semibold)' }}>This action CANNOT be undone.</p>
        </VStack>

        <HStack justify="center" gap="medium" style={{ paddingTop: 'var(--spacing-4)' }}>
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger" disabled={isLoading} isLoading={isLoading}>
            Delete All Allocations
          </Button>
        </HStack>
      </VStack>
    </Modal>
  )
}

export default DeleteAllAllocationsModal
