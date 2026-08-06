import { useState } from "react"
import { FaFileSignature, FaCalendarAlt, FaCheck, FaTimes } from "react-icons/fa"
import { Checkbox, Heading, HStack, Surface, Text, VStack } from "@/components/ui"
import { Button } from "czero/react"
import { Modal } from "@/components/ui"
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

  return (
    <Modal title={undertaking.title} onClose={handleClose} size="lg">
      <VStack gap={6}>
        {/* Undertaking metadata */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-4)", borderRadius: "var(--radius-input)" }}>
          <HStack gap="none" align="center">
            <Surface bg="info" padding={2} radius="full">
              <FaFileSignature color="var(--color-info)" />
            </Surface>
            <Text as="span" size="sm" color="tertiary" style={{ marginLeft: "var(--spacing-2)" }}>{undertaking.status === "not_viewed" ? "New" : "Pending Acceptance"}</Text>
          </HStack>
          <HStack gap="none" align="center">
            <FaCalendarAlt style={{ marginRight: "var(--spacing-2)" }} color="var(--color-text-placeholder)" />
            <Text as="span" size="sm" color="tertiary">
              Deadline: {formatDate(undertaking.deadline)}
              {deadlinePassed && <Text as="span" size="xs" color="danger-text" style={{ marginLeft: "var(--spacing-2)" }}>(Overdue)</Text>}
            </Text>
          </HStack>
        </div>

        {/* Description */}
        <div>
          <Heading as="h3" size="sm" weight="medium" color="body" style={{ marginBottom: "var(--spacing-2)" }}>Description</Heading>
          <Surface as="p" bg="tertiary" padding={4} radius="var(--radius-input)" color="tertiary" size="sm">{undertaking.description}</Surface>
        </div>

        {/* Content */}
        <div>
          <Heading as="h3" size="sm" weight="medium" color="body" style={{ marginBottom: "var(--spacing-2)" }}>Undertaking Content</Heading>
          <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-4)", borderRadius: "var(--radius-input)", border: `var(--border-1) solid var(--color-border-primary)`, maxHeight: "15rem", overflowY: "auto" }}>
            <Text as="div" color="body" size="sm" style={{ whiteSpace: "pre-wrap" }}>{undertaking.content}</Text>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <Checkbox id="confirm-read" checked={hasConfirmed} onChange={() => setHasConfirmed(!hasConfirmed)} label="I confirm that I have read and understood the above undertaking and agree to abide by it." />

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)", paddingTop: "var(--spacing-4)", borderTop: `var(--border-1) solid var(--color-border-light)` }}>
          <Button type="button" onClick={handleClose} variant="secondary" size="md">
            <FaTimes /> Close
          </Button>
          <Button type="button" onClick={handleAccept} disabled={isAccepting || !hasConfirmed} variant="success" size="md" loading={isAccepting}>
            {!isAccepting && <FaCheck />} I Accept
          </Button>
        </div>
      </VStack>
    </Modal>
  )
}

export default UndertakingDetailModal
