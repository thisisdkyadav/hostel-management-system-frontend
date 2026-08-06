import { useState } from "react"
import { FaBuilding, FaEnvelope, FaEdit, FaTrash } from "react-icons/fa"
import EditHostelGateModal from "./EditHostelGateModal"
import { hostelGateApi } from "../../../service"
import { Card, CardBody, CardFooter, CardHeader, Heading, HStack, Surface, Text, useConfirm } from "@/components/ui"
import { Button } from "czero/react"

const HostelGateCard = ({ gate, onUpdate, onDelete }) => {
  const confirm = useConfirm()
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (await confirm({ message: "Are you sure you want to delete this hostel gate login?", isDestructive: true })) {
      try {
        setIsDeleting(true)
        await hostelGateApi.deleteHostelGate(gate.hostelId._id)
        alert("Hostel gate login deleted successfully!")
        if (onDelete) onDelete()
      } catch (error) {
        console.error("Error deleting hostel gate login:", error)
        alert("Failed to delete hostel gate login. Please try again.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      <Card>
        <CardHeader style={{ marginBottom: 0 }}>
          <HStack gap="none" align="start" justify="between">
            <HStack gap="none" align="center">
              <Surface bg="brand" padding={2} radius="lg" style={{ marginRight: 'var(--spacing-3)' }}>
                <FaBuilding style={{ fontSize: 'var(--icon-lg)' }} color="var(--color-primary)" />
              </Surface>
              <Heading as="h3" weight="semibold" size="lg" color="secondary">{gate.userId?.name || "Unknown Hostel"}</Heading>
            </HStack>
            <HStack gap={2}>
              <Button onClick={() => setShowEditModal(true)} variant="ghost" size="sm" title="Edit hostel gate login"><FaEdit /></Button>
              <Button onClick={handleDelete} variant="ghost" size="sm" loading={isDeleting} disabled={isDeleting} title="Delete hostel gate login"><FaTrash /></Button>
            </HStack>
          </HStack>
        </CardHeader>

        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
          <HStack gap="none" align="start">
            <FaEnvelope style={{ marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} color="var(--color-text-muted)" />
            <Text as="span" color="muted" style={{ wordBreak: 'break-all' }}>{gate.userId?.email}</Text>
          </HStack>
          <HStack gap="none" align="start">
            <div style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }}>
              <Text as="span" size="xs" weight="medium">Created</Text>
            </div>
            <Text as="span" color="muted">{formatDate(gate.createdAt)}</Text>
          </HStack>
          <HStack gap="none" align="start">
            <div style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }}>
              <Text as="span" size="xs" weight="medium">Updated</Text>
            </div>
            <Text as="span" color="muted">{formatDate(gate.updatedAt)}</Text>
          </HStack>
        </CardBody>
      </Card>

      {showEditModal && <EditHostelGateModal show={showEditModal} gate={gate} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
    </>
  )
}

export default HostelGateCard
