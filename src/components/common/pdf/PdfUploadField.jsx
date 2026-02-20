import { useState } from "react"
import { Upload, Eye } from "lucide-react"
import { Button } from "czero/react"
import { useToast } from "@/components/ui/feedback"
import { Label } from "@/components/ui/form"
import PdfViewerModal from "./PdfViewerModal"

const resolveUploadedUrl = (uploadResult) => {
  if (typeof uploadResult === "string") return uploadResult
  if (uploadResult?.url) return uploadResult.url
  if (uploadResult?.data?.url) return uploadResult.data.url
  return ""
}

const PdfUploadField = ({
  label,
  value,
  onChange,
  onUpload,
  disabled = false,
  required = false,
  maxSizeMb = 5,
  uploadedText = "Document uploaded",
  viewerTitle = "Document",
  viewerSubtitle = "PDF Document",
  downloadFileName = "document.pdf",
}) => {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showViewer, setShowViewer] = useState(false)

  const maxSizeBytes = maxSizeMb * 1024 * 1024

  const validateFile = (file) => {
    if (!file) return "Please select a PDF file"
    if (!(file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) {
      return "Only PDF files are allowed"
    }
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMb}MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
    }
    return null
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return

    try {
      setUploading(true)
      const response = await onUpload(selectedFile)
      const uploadedUrl = resolveUploadedUrl(response)

      if (!uploadedUrl) {
        throw new Error("Upload response did not contain file URL")
      }

      onChange(uploadedUrl)
      setSelectedFile(null)
      toast.success(`${label} uploaded`)
    } catch (error) {
      toast.error(error.message || `Failed to upload ${label}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
        <Label size="sm" required={required} style={{ color: "var(--color-text-muted)" }}>
          {label}
        </Label>

        {value ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-2)", padding: "var(--spacing-3)", border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-bg-secondary)" }}>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
              {uploadedText}
            </span>

            <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
              <Button size="sm" variant="secondary" onClick={() => setShowViewer(true)}>
                <Eye size={14} /> View
              </Button>
              {!disabled && (
                <Button size="sm" variant="ghost" onClick={() => onChange("")}>
                  Change
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", padding: "var(--spacing-3)", border: "var(--border-1) dashed var(--color-border-primary)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-bg-secondary)" }}>
            {selectedFile ? (
              <>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                  {selectedFile.name}
                </span>
                {!disabled && (
                  <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedFile(null)}>
                      Remove
                    </Button>
                    <Button size="sm" onClick={handleUpload} loading={uploading}>
                      <Upload size={14} /> Upload
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  PDF only (max {maxSizeMb}MB)
                </span>
                {!disabled && (
                  <label style={{ margin: 0 }}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <span style={{ padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-md)", backgroundColor: "var(--button-primary-bg)", color: "var(--color-white)", fontSize: "var(--font-size-sm)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)" }}>
                      <Upload size={14} /> Select File
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <PdfViewerModal
        isOpen={showViewer}
        onClose={() => setShowViewer(false)}
        documentUrl={value}
        title={viewerTitle}
        subtitle={viewerSubtitle}
        downloadFileName={downloadFileName}
      />
    </>
  )
}

export default PdfUploadField
