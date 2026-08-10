import { Button, Modal } from "hzero"
import { Download } from "lucide-react"
import { getMediaUrl, getMediaDownloadUrl } from "../../utils/mediaUtils"
import { isImageAttachment } from "./expenditureConstants"

/**
 * View a single attachment (PDF or image). We branch on the stored contentType
 * because storage-backend "media://<uuid>" refs carry no file extension (so the
 * generic PdfViewerModal, which sniffs the URL, would treat images as PDFs).
 */
const AttachmentViewerModal = ({ attachment, onClose }) => {
  if (!attachment) return null

  const url = getMediaUrl(attachment.fileRef)
  const downloadUrl = getMediaDownloadUrl(attachment.fileRef)
  const image = isImageAttachment(attachment)

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = attachment.originalName || "attachment"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={attachment.originalName || "Attachment"}
      description={image ? "Image" : "PDF document"}
      width={900}
      fullHeight
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleDownload}>
            <Download size={16} /> Download
          </Button>
        </>
      }
    >
      <div
        style={{
          height: "100%",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg-secondary)",
          border: "var(--border-1) solid var(--color-border-primary)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        {image ? (
          <img
            src={url}
            alt={attachment.originalName || "attachment"}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        ) : (
          <object data={url} type="application/pdf" style={{ width: "100%", height: "100%", minHeight: "60vh" }}>
            <div style={{ padding: "var(--spacing-8)", textAlign: "center" }}>
              This browser can't display the PDF inline.{" "}
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>
                Open in a new tab
              </a>
              .
            </div>
          </object>
        )}
      </div>
    </Modal>
  )
}

export default AttachmentViewerModal
