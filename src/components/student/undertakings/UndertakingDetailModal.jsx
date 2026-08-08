import { useState } from "react"
import { Calendar, Check, FileSignature, FileText, ScrollText, X } from "lucide-react"
import { Badge, Button, Checkbox, DetailSection, HStack, Modal, Text, VStack } from "hzero"

const UndertakingDetailModal = ({ show, undertaking, onClose, onAccept }) => {
  const [isAccepting, setIsAccepting] = useState(false)
  const [hasConfirmed, setHasConfirmed] = useState(false)

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  }

  // Check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return deadlineDate < now
  }

  const handleAccept = async () => {
    if (!hasConfirmed) {
      setHasConfirmed(true)
      return
    }

    try {
      setIsAccepting(true)
      await onAccept(undertaking.id)
    } finally {
      setIsAccepting(false)
      setHasConfirmed(false)
    }
  }

  const handleClose = () => {
    setHasConfirmed(false)
    onClose()
  }

  if (!show || !undertaking) return null

  const deadlinePassed = isDeadlinePassed(undertaking.deadline)

  const footer = (
    <>
      <Button type="button" onClick={handleClose} variant="secondary" size="md">
        <X size={16} /> Close
      </Button>
      <Button type="button" onClick={handleAccept} disabled={isAccepting || !hasConfirmed} variant="success" size="md" loading={isAccepting}>
        {!isAccepting && <Check size={16} />} I accept
      </Button>
    </>
  )

  return (
    <Modal title={undertaking.title} onClose={handleClose} size="lg" footer={footer}>
      <VStack gap="large">
        {/* Undertaking metadata */}
        <HStack gap={2} align="center" justify="between" wrap>
          <Badge variant="info" size="medium" icon={<FileSignature />}>
            {undertaking.status === "not_viewed" ? "New" : "Pending acceptance"}
          </Badge>
          <Badge variant={deadlinePassed ? "danger" : "default"} size="medium" icon={<Calendar />}>
            Deadline: {formatDate(undertaking.deadline)}
            {deadlinePassed && " (overdue)"}
          </Badge>
        </HStack>

        <DetailSection title="Description" icon={FileText}>
          <Text as="p">{undertaking.description}</Text>
        </DetailSection>

        <DetailSection title="Undertaking content" icon={ScrollText}>
          <div style={{ maxHeight: "15rem", overflowY: "auto" }}>
            <Text as="div" style={{ whiteSpace: "pre-wrap" }}>
              {undertaking.content}
            </Text>
          </div>
        </DetailSection>

        {/* Confirmation checkbox */}
        <Checkbox id="confirm-read" checked={hasConfirmed} onChange={() => setHasConfirmed(!hasConfirmed)} label="I confirm that I have read and understood the above undertaking and agree to abide by it." />
      </VStack>
    </Modal>
  )
}

export default UndertakingDetailModal
