import { Modal } from "czero/react"
import { Mail, Paperclip, Calendar, Users } from "lucide-react"

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
    ...(emailLog.includeInitialComplaint ? [{ name: "Initial Complaint PDF", type: "complaint" }] : []),
    ...(emailLog.statementAttachments || []).map((a) => ({ name: a.pdfName || "Statement", type: "statement" })),
    ...(emailLog.evidenceAttachments || []).map((a) => ({ name: a.pdfName || "Evidence", type: "evidence" })),
    ...(emailLog.extraDocumentAttachments || []).map((a) => ({ name: a.pdfName || "Extra Doc", type: "extra" })),
    ...(emailLog.extraAttachments || []).map((a) => ({ name: a.fileName || "Attachment", type: "extra" })),
  ]

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleString()
  }

  const sectionStyle = {
    padding: "var(--spacing-3)",
    backgroundColor: "var(--color-bg-secondary)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--color-border-primary)",
  }

  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 6,
  }

  const valueStyle = {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-primary)",
    lineHeight: 1.5,
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Details"
      width={600}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        {/* Sent Date */}
        <div style={sectionStyle}>
          <div style={labelStyle}>
            <Calendar size={12} />
            Sent At
          </div>
          <div style={valueStyle}>{formatDate(emailLog.sentAt)}</div>
        </div>

        {/* Recipients */}
        <div style={sectionStyle}>
          <div style={labelStyle}>
            <Users size={12} />
            Recipients ({recipients.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {recipients.map((email, index) => (
              <span
                key={`${email}-${index}`}
                style={{
                  padding: "2px 8px",
                  backgroundColor: "var(--color-primary-bg)",
                  borderRadius: "var(--radius-badge)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-primary)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                {email}
              </span>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div style={sectionStyle}>
          <div style={labelStyle}>
            <Mail size={12} />
            Subject
          </div>
          <div style={{ ...valueStyle, fontWeight: "var(--font-weight-semibold)" }}>
            {emailLog.subject || "(No subject)"}
          </div>
        </div>

        {/* Body */}
        <div style={sectionStyle}>
          <div style={labelStyle}>
            Body
          </div>
          <div
            style={{
              ...valueStyle,
              whiteSpace: "pre-wrap",
              maxHeight: 200,
              overflowY: "auto",
              padding: "var(--spacing-2)",
              backgroundColor: "var(--color-bg-primary)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border-light)",
            }}
          >
            {emailLog.body || "(No body)"}
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div style={sectionStyle}>
            <div style={labelStyle}>
              <Paperclip size={12} />
              Attachments ({attachments.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {attachments.map((attachment, index) => (
                <span
                  key={`attachment-${index}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    backgroundColor: "var(--color-bg-tertiary)",
                    borderRadius: "var(--radius-badge)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-body)",
                    border: "1px solid var(--color-border-primary)",
                  }}
                >
                  <Paperclip size={10} />
                  {attachment.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default EmailDetailModal
