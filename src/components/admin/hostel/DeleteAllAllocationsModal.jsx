import React from "react"
import { HStack, Text, VStack } from "@/components/ui"
import { Button } from "czero/react"
import { Modal } from "@/components/ui"
import { TriangleAlert } from "lucide-react"

const DeleteAllAllocationsModal = ({ onClose, onConfirm, hostelName, isLoading }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Delete All Allocations" width={450}>
      <VStack gap="large" style={{ padding: 'var(--spacing-4) 0' }}>
        <HStack gap="none" justify="center">
          <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-full)' }}>
            <TriangleAlert size={32} />
          </div>
        </HStack>

        <VStack gap="medium" style={{ textAlign: 'center' }}>
          <Text color="danger" weight="bold" size="lg">CRITICAL WARNING</Text>
          <Text color="secondary">
            This will remove <Text as="span" weight="bold">ALL</Text> student room allocations from <Text as="span" weight="bold">{hostelName}</Text>.
          </Text>
          <Text color="secondary">All students will be immediately removed from their rooms.</Text>
          <Text color="danger" weight="semibold">This action CANNOT be undone.</Text>
        </VStack>

        <HStack justify="center" gap="medium" style={{ paddingTop: 'var(--spacing-4)' }}>
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger" disabled={isLoading} loading={isLoading}>
            Delete All Allocations
          </Button>
        </HStack>
      </VStack>
    </Modal>
  )
}

export default DeleteAllAllocationsModal
