import { useState } from "react"
import { Upload, Eye } from "lucide-react"
import { Button, HStack, Label, Surface, Text, useToast, VStack } from "hzero"
import { resolveUploadedFileRef } from "@/service"
import PdfViewerModal from "./PdfViewerModal"

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|bmp|svg)(?:$|\?)/i

const resolveUploadedUrl = (uploadResult) => {
  return resolveUploadedFileRef(uploadResult)
}

const PdfUploadField = ({
  label,
  value,
  onChange,
  onUpload,
  onPendingFileChange,
  disabled = false,
  required = false,
  maxSizeMb = 5,
  uploadedText = "Document uploaded",
  viewerTitle = "Document",
  viewerSubtitle = "PDF Document",
  downloadFileName = "document.pdf",
  accept = ".pdf",
  acceptHint = "PDF only",
  validateType,
  fileTypeHint,
  // Optional async (file) => File that checks/normalises the picked file; throw an Error to reject it.
  // When given it replaces the built-in type and size checks.
  prepareFile,
  // Upload straight after a file is picked instead of waiting for an Upload click.
  autoUpload = false,
}) => {
  const resolvedFileTypeHint =
    fileTypeHint ||
    (typeof accept === "string" && accept.startsWith("image/")
      ? "image"
      : IMAGE_EXT_RE.test(String(downloadFileName || ""))
        ? "image"
        : undefined)
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showViewer, setShowViewer] = useState(false)

  const maxSizeBytes = maxSizeMb * 1024 * 1024

  // Set the selected (not-yet-uploaded) file and notify the parent so it can warn
  // on submit if the user forgot to click Upload.
  const applySelectedFile = (file) => {
    setSelectedFile(file)
    onPendingFileChange?.(file)
  }

  const isTypeAllowed = (file) =>
    validateType ? validateType(file) : file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")

  const validateFile = (file) => {
    if (!file) return "Please select a file"
    if (!isTypeAllowed(file)) {
      return `Only ${acceptHint} files are allowed`
    }
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMb}MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
    }
    return null
  }

  const handleFileChange = async (event) => {
    const picked = event.target.files?.[0]
    // Clear the input so picking the same file again still fires onChange.
    event.target.value = ""
    if (!picked) return

    let file = picked
    if (prepareFile) {
      try {
        setUploading(true)
        file = await prepareFile(picked)
      } catch (error) {
        toast.error(error.message || "That file can't be used")
        return
      } finally {
        setUploading(false)
      }
    } else {
      const validationError = validateFile(file)
      if (validationError) {
        toast.error(validationError)
        return
      }
    }

    applySelectedFile(file)
    if (autoUpload) await handleUpload(file)
  }

  const handleUpload = async (file = selectedFile) => {
    if (!file || !onUpload) return

    try {
      setUploading(true)
      const response = await onUpload(file)
      const uploadedUrl = resolveUploadedUrl(response)

      if (!uploadedUrl) {
        throw new Error("Upload response did not contain file URL")
      }

      onChange(uploadedUrl)
      applySelectedFile(null)
      toast.success(`${label} uploaded`)
    } catch (error) {
      toast.error(error.message || `Failed to upload ${label}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <VStack gap={2}>
        <Label size="sm" required={required} style={{ color: "var(--color-text-muted)" }}>
          {label}
        </Label>

        {value ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-2)", padding: "var(--spacing-3)", border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-bg-secondary)" }}>
            <Text as="span" size="sm" color="body">
              {uploadedText}
            </Text>

            <HStack gap={2} wrap>
              <Button size="sm" variant="secondary" onClick={() => setShowViewer(true)}>
                <Eye size={14} /> View
              </Button>
              {!disabled && (
                <Button size="sm" variant="ghost" onClick={() => onChange("")}>
                  Change
                </Button>
              )}
            </HStack>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", padding: "var(--spacing-3)", border: "var(--border-1) dashed var(--color-border-primary)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-bg-secondary)" }}>
            {selectedFile ? (
              <>
                <Text as="span" size="sm" color="body">
                  {selectedFile.name}
                </Text>
                {!disabled && (
                  <HStack gap={2} wrap>
                    <Button size="sm" variant="secondary" onClick={() => applySelectedFile(null)}>
                      Remove
                    </Button>
                    <Button size="sm" onClick={() => handleUpload()} loading={uploading}>
                      <Upload size={14} /> Upload
                    </Button>
                  </HStack>
                )}
              </>
            ) : (
              <HStack gap={2} align="center" justify="between" wrap>
                <Text as="span" size="sm" color="muted">
                  {acceptHint} (max {maxSizeMb}MB)
                </Text>
                {!disabled && (
                  <label style={{ margin: 0 }}>
                    <input
                      type="file"
                      accept={accept}
                      onChange={handleFileChange}
                      disabled={uploading}
                      style={{ display: "none" }}
                    />
                    <Surface as="span" bg="var(--button-primary-bg)" padding="var(--spacing-2) var(--spacing-3)" radius="md" color="var(--color-white)" size="sm" style={{ cursor: uploading ? "progress" : "pointer", display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", opacity: uploading ? 0.7 : 1 }}>
                      <Upload size={14} /> {uploading ? "Uploading…" : "Select File"}
                    </Surface>
                  </label>
                )}
              </HStack>
            )}
          </div>
        )}
      </VStack>

      <PdfViewerModal
        isOpen={showViewer}
        onClose={() => setShowViewer(false)}
        documentUrl={value}
        title={viewerTitle}
        subtitle={viewerSubtitle}
        downloadFileName={downloadFileName}
        fileTypeHint={resolvedFileTypeHint}
      />
    </>
  )
}

export default PdfUploadField
