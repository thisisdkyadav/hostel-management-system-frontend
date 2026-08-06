import { useState } from "react"
import { FaFileSignature, FaEdit, FaTrash, FaCalendarAlt, FaUsers, FaInfoCircle, FaClipboardCheck } from "react-icons/fa"
import EditUndertakingModal from "./EditUndertakingModal"
import ManageStudentsModal from "./ManageStudentsModal"
import ViewAcceptanceStatusModal from "./ViewAcceptanceStatusModal"
import { adminApi } from "../../../service"
import { Card, CardBody, CardFooter, CardHeader, Heading, HStack, InfoRow, Surface, Text, useConfirm } from "@/components/ui"
import { Button } from "czero/react"

const UndertakingCard = ({ undertaking, onUpdate, onDelete, isReadOnly = false }) => {
  const confirm = useConfirm()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (await confirm({ message: "Are you sure you want to delete this undertaking?", isDestructive: true })) {
      try {
        setIsDeleting(true)
        await adminApi.deleteUndertaking(undertaking.id)
        alert("Undertaking deleted successfully!")
        if (onDelete) onDelete()
      } catch (error) {
        console.error("Error deleting undertaking:", error)
        alert("Failed to delete undertaking. Please try again.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Calculate acceptance percentage
  const acceptancePercentage = undertaking.acceptedCount && undertaking.totalStudents ? Math.round((undertaking.acceptedCount / undertaking.totalStudents) * 100) : 0

  return (
    <>
      <Card>
        <CardHeader style={{ marginBottom: 0 }}>
          <HStack gap="none" align="start" justify="between">
            <HStack gap="none" align="center">
              <Surface bg="brand" padding={2} radius="lg" style={{ marginRight: 'var(--spacing-3)' }}>
                <FaFileSignature style={{ color: 'var(--color-primary)', fontSize: 'var(--icon-lg)' }} />
              </Surface>
              <Heading as="h3" weight="semibold" size="lg" color="secondary">{undertaking.title}</Heading>
            </HStack>
            {!isReadOnly && (
              <HStack gap={2}>
                <Button onClick={() => setShowEditModal(true)} variant="ghost" size="sm" title="Edit undertaking"><FaEdit /></Button>
                <Button onClick={handleDelete} variant="ghost" size="sm" loading={isDeleting} disabled={isDeleting} title="Delete undertaking"><FaTrash /></Button>
              </HStack>
            )}
          </HStack>
        </CardHeader>

        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
          <Text as="div" color="muted">
            <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{undertaking.description}</p>
          </Text>
          <HStack gap="none" align="start">
            <FaCalendarAlt style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <Text as="div" color="muted">
              <span>Deadline: {formatDate(undertaking.deadline)}</span>
            </Text>
          </HStack>
          <HStack gap="none" align="start">
            <FaUsers style={{ color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', marginRight: 'var(--spacing-3)', flexShrink: 0 }} />
            <Text as="div" color="muted">
              <span>Students: {undertaking.totalStudents || 0}</span>
            </Text>
          </HStack>

          {/* Acceptance progress bar */}
          <div style={{ marginTop: 'var(--spacing-2)' }}>
            <InfoRow label="Acceptance Status" value={<>{acceptancePercentage}%</>} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-1)' }} />
            <div style={{ width: '100%', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-full)', height: '0.625rem' }}>
              <div style={{ backgroundColor: 'var(--color-success)', height: '0.625rem', borderRadius: 'var(--radius-full)', width: `${acceptancePercentage}%` }}></div>
            </div>
          </div>
        </CardBody>

        <CardFooter style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)', borderTop: 'var(--border-1) solid var(--color-border-light)', display: 'grid', gridTemplateColumns: isReadOnly ? '1fr' : 'repeat(2, 1fr)', gap: 'var(--spacing-3)' }}>
          {!isReadOnly && (
            <Button onClick={() => setShowManageStudentsModal(true)} variant="secondary" size="sm">
              <FaUsers />
              Manage Students
            </Button>
          )}
          <Button onClick={() => setShowStatusModal(true)} variant="success" size="sm">
            <FaClipboardCheck />
            View Status
          </Button>
        </CardFooter>
      </Card>

      {!isReadOnly && showEditModal && <EditUndertakingModal show={showEditModal} undertaking={undertaking} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />}
      {!isReadOnly && showManageStudentsModal && <ManageStudentsModal show={showManageStudentsModal} undertakingId={undertaking.id} undertakingTitle={undertaking.title} onClose={() => setShowManageStudentsModal(false)} onUpdate={onUpdate} />}
      {showStatusModal && <ViewAcceptanceStatusModal show={showStatusModal} undertakingId={undertaking.id} undertakingTitle={undertaking.title} onClose={() => setShowStatusModal(false)} />}
    </>
  )
}

export default UndertakingCard
