import { useState } from "react"
import { Text } from "hzero"
import { FileText, Image as ImageIcon, Eye } from "lucide-react"
import AttachmentViewerModal from "./AttachmentViewerModal"
import { isImageAttachment } from "./expenditureConstants"

/** Read-only clickable chips for an entry's attachments; opens a viewer on click. */
const AttachmentList = ({ attachments = [], onRemove = null }) => {
  const [viewing, setViewing] = useState(null)
  if (!attachments.length) return null

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)", marginTop: "var(--spacing-2)" }}>
      {attachments.map((a, i) => (
        <span
          key={a.fileRef || i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--spacing-1-5)",
            padding: "var(--spacing-1) var(--spacing-2-5)",
            border: "var(--border-1) solid var(--color-border-primary)",
            borderRadius: "var(--radius-full)",
            background: "var(--color-bg-secondary)",
            maxWidth: "240px",
          }}
        >
          {isImageAttachment(a) ? (
            <ImageIcon size={14} color="var(--color-text-muted)" />
          ) : (
            <FileText size={14} color="var(--color-text-muted)" />
          )}
          <button
            type="button"
            onClick={() => setViewing(a)}
            title={`View ${a.originalName || "attachment"}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--spacing-1)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-body)",
              padding: 0,
              maxWidth: "180px",
            }}
          >
            <Text as="span" size="xs" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {a.originalName || "attachment"}
            </Text>
            <Eye size={13} />
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(a)}
              aria-label="Remove attachment"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0, lineHeight: 0 }}
            >
              ×
            </button>
          )}
        </span>
      ))}
      {viewing && <AttachmentViewerModal attachment={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

export default AttachmentList
