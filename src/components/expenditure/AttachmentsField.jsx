import { useRef, useState } from "react"
import { Button, IconButton, Text, useToast } from "hzero"
import { Paperclip, Eye, X, FileText, Image as ImageIcon } from "lucide-react"
import AttachmentViewerModal from "./AttachmentViewerModal"
import { uploadAttachments } from "./uploadAttachments"
import { ATTACHMENT_ACCEPT, MAX_ATTACHMENTS, isImageAttachment } from "./expenditureConstants"

/**
 * Reusable multi-file (PDF/image) uploader used by every entry form. Files are
 * uploaded one-by-one to the shared upload endpoint; the resulting attachments
 * ({ fileRef, originalName, contentType, size }) are held in the parent's form
 * state via `onChange` and saved when the entry is submitted.
 */
const AttachmentsField = ({ label = "Attachments", value = [], onChange, disabled = false }) => {
  const { toast } = useToast()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [viewing, setViewing] = useState(null)

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    if (value.length + files.length > MAX_ATTACHMENTS) {
      toast.error(`You can attach at most ${MAX_ATTACHMENTS} files.`)
      return
    }
    setUploading(true)
    try {
      const uploaded = await uploadAttachments(files)
      onChange?.([...value, ...uploaded])
    } catch (err) {
      toast.error(err?.message || "Failed to upload file(s).")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removeAt = (index) => onChange?.(value.filter((_, i) => i !== index))

  return (
    <div>
      <Text as="div" size="sm" weight="medium" color="muted" style={{ marginBottom: "var(--spacing-2)" }}>
        {label}
      </Text>

      <input
        ref={inputRef}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {value.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", marginBottom: "var(--spacing-2)" }}>
          {value.map((a, i) => (
            <div
              key={a.fileRef || i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-2)",
                padding: "var(--spacing-2) var(--spacing-3)",
                border: "var(--border-1) solid var(--color-border-primary)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-secondary)",
              }}
            >
              {isImageAttachment(a) ? (
                <ImageIcon size={16} color="var(--color-text-muted)" />
              ) : (
                <FileText size={16} color="var(--color-text-muted)" />
              )}
              <Text as="span" size="sm" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.originalName || "attachment"}
              </Text>
              <IconButton icon={<Eye size={16} />} variant="ghost" size="small" ariaLabel="View attachment" onClick={() => setViewing(a)} />
              {!disabled && (
                <IconButton icon={<X size={16} />} variant="ghost" size="small" ariaLabel="Remove attachment" onClick={() => removeAt(i)} />
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} loading={uploading} disabled={uploading}>
          <Paperclip size={16} /> {uploading ? "Uploading…" : "Add files (PDF or image)"}
        </Button>
      )}

      {viewing && <AttachmentViewerModal attachment={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

export default AttachmentsField
