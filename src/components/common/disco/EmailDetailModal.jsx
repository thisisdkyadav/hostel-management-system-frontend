import { Badge, DetailSection, HStack, Modal, Text, VStack } from "hzero"
import { Calendar, FileText, Mail, Paperclip, Users } from "lucide-react"

/**
 * EmailDetailModal - Modal for viewing email details
 *
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close handler
 * @param {object} emailLog - Email log object with to, subject, body, attachments, sentAt
 */
const EmailDetailModal = ({ isOpen, onClose, emailLog }) => {
  if (!emailLog) return null

  const recipients = Array.isArray(emailLog.to)
    ? emailLog.to
    : typeof emailLog.to === "string"
      ? emailLog.to.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
      : []

  const attachments = [
    ...(emailLog.includeInitialComplaint ? [{ name: "Initial complaint PDF", type: "complaint" }] : []),
    ...(emailLog.statementAttachments || []).map((a) => ({ name: a.pdfName || "Statement", type: "statement" })),
    ...(emailLog.evidenceAttachments || []).map((a) => ({ name: a.pdfName || "Evidence", type: "evidence" })),
    ...(emailLog.extraDocumentAttachments || []).map((a) => ({ name: a.pdfName || "Extra document", type: "extra" })),
    ...(emailLog.extraAttachments || []).map((a) => ({ name: a.fileName || "Attachment", type: "extra" })),
  ]

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleString()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email details"
      width={600}
    >
      <VStack gap={3}>
        <DetailSection title="Sent at" icon={Calendar}>
          <Text as="div" size="sm" color="body">{formatDate(emailLog.sentAt)}</Text>
        </DetailSection>

        <DetailSection title={`Recipients (${recipients.length})`} icon={Users}>
          <HStack gap={2} wrap>
            {recipients.map((email, index) => (
              <Badge variant="primary" size="small" key={`${email}-${index}`}>
                {email}
              </Badge>
            ))}
          </HStack>
        </DetailSection>

        <DetailSection title="Subject" icon={Mail}>
          <Text as="div" size="sm" weight="semibold" color="body">
            {emailLog.subject || "(No subject)"}
          </Text>
        </DetailSection>

        <DetailSection title="Body" icon={FileText}>
          <Text as="div" size="sm" color="body" style={{ whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto" }}>
            {emailLog.body || "(No body)"}
          </Text>
        </DetailSection>

        {attachments.length > 0 && (
          <DetailSection title={`Attachments (${attachments.length})`} icon={Paperclip}>
            <HStack gap={2} wrap>
              {attachments.map((attachment, index) => (
                <Badge variant="default" size="small" icon={<Paperclip />} key={`attachment-${index}`}>
                  {attachment.name}
                </Badge>
              ))}
            </HStack>
          </DetailSection>
        )}
      </VStack>
    </Modal>
  )
}

export default EmailDetailModal
