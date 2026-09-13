import { useMemo, useRef, useState } from "react"
import { Alert, Button, FileInput, Heading, HStack, Modal, Progress, Spinner, Surface, Text, VStack } from "hzero"
import { Check, CircleAlert, FileText, Upload, X } from "lucide-react"
import { insuranceProviderApi } from "../../../service"
import {
  extractRollNumberFromInsurancePdfFilename,
  INSURANCE_PDF_MAX_BYTES,
  isPdfFile,
} from "../../../utils/insurancePdf"

const STATUS = {
  READY: "ready",
  INVALID: "invalid",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
}

const statusLabel = (item) => {
  if (item.status === STATUS.UPLOADING) return "Uploading"
  if (item.status === STATUS.SUCCESS) return "Attached"
  if (item.status === STATUS.ERROR) return "Failed"
  if (item.status === STATUS.INVALID) return "Skipped"
  return "Ready"
}

const buildItems = (fileList) => {
  const files = Array.from(fileList || [])
  return files.map((file, index) => {
    const fileName = file.name || `file-${index + 1}.pdf`
    const rollNumber = extractRollNumberFromInsurancePdfFilename(fileName)
    if (!isPdfFile(file)) {
      return {
        id: `${fileName}-${file.size}-${file.lastModified}-${index}`,
        file,
        fileName,
        rollNumber: null,
        status: STATUS.INVALID,
        error: "Only PDF files are accepted",
      }
    }
    if (file.size > INSURANCE_PDF_MAX_BYTES) {
      return {
        id: `${fileName}-${file.size}-${file.lastModified}-${index}`,
        file,
        fileName,
        rollNumber,
        status: STATUS.INVALID,
        error: "File must be 10MB or smaller",
      }
    }
    if (!rollNumber) {
      return {
        id: `${fileName}-${file.size}-${file.lastModified}-${index}`,
        file,
        fileName,
        rollNumber: null,
        status: STATUS.INVALID,
        error: "Could not read a roll number. Use {id}_{rollNumber}.pdf",
      }
    }
    return {
      id: `${fileName}-${file.size}-${file.lastModified}-${index}`,
      file,
      fileName,
      rollNumber,
      status: STATUS.READY,
      error: "",
    }
  })
}

const BulkInsurancePdfUploadModal = ({ isOpen, onClose }) => {
  const fileInputRef = useRef(null)
  const [items, setItems] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)

  const counts = useMemo(() => {
    const success = items.filter((item) => item.status === STATUS.SUCCESS).length
    const failed = items.filter((item) => item.status === STATUS.ERROR || item.status === STATUS.INVALID).length
    const ready = items.filter((item) => item.status === STATUS.READY).length
    return { success, failed, ready, total: items.length }
  }, [items])

  const reset = () => {
    setItems([])
    setIsUploading(false)
    setProcessedCount(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleClose = () => {
    if (isUploading) return
    reset()
    onClose()
  }

  const applyFiles = (fileList) => {
    setItems(buildItems(fileList))
    setProcessedCount(0)
  }

  const handleFileChange = (event) => {
    applyFiles(event.target.files)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    if (isUploading) return
    applyFiles(event.dataTransfer.files)
  }

  const removeItem = (id) => {
    if (isUploading) return
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const uploadReadyItems = async (sourceItems) => {
    const queue = sourceItems.filter((item) => item.status === STATUS.READY)
    if (queue.length === 0) return

    setIsUploading(true)
    setProcessedCount(0)

    for (const current of queue) {
      setItems((prev) => prev.map((item) => (
        item.id === current.id ? { ...item, status: STATUS.UPLOADING, error: "" } : item
      )))

      try {
        const formData = new FormData()
        formData.append("document", current.file, current.fileName)
        const result = await insuranceProviderApi.uploadStudentInsurancePdf(formData)
        setItems((prev) => prev.map((item) => (
          item.id === current.id
            ? {
                ...item,
                status: STATUS.SUCCESS,
                rollNumber: result.rollNumber || item.rollNumber,
                error: "",
              }
            : item
        )))
      } catch (error) {
        setItems((prev) => prev.map((item) => (
          item.id === current.id
            ? {
                ...item,
                status: STATUS.ERROR,
                error: error.message || "Failed to attach PDF",
              }
            : item
        )))
      }

      setProcessedCount((value) => value + 1)
    }

    setIsUploading(false)
  }

  const handleUpload = () => uploadReadyItems(items)

  const retryFailed = () => {
    const next = items.map((item) => (
      item.status === STATUS.ERROR ? { ...item, status: STATUS.READY, error: "" } : item
    ))
    setItems(next)
    uploadReadyItems(next)
  }

  if (!isOpen) return null

  const progressMax = Math.max(counts.ready + counts.success + items.filter((item) => item.status === STATUS.ERROR).length, 1)
  const progressValue = isUploading ? processedCount : counts.success + items.filter((item) => item.status === STATUS.ERROR).length
  const finished = !isUploading && items.length > 0 && counts.ready === 0

  return (
    <Modal title="Upload Insurance PDFs" onClose={handleClose} width={720}>
      <VStack gap={5}>
        <Text size="sm" color="muted">
          Select multiple PDF files. Each file is attached to the student whose roll number is in the file name, for example <Text as="span" weight="medium">10238188_230001024.pdf</Text>.
        </Text>

        <Surface
          as="button"
          type="button"
          bg="secondary"
          padding={8}
          radius="xl"
          disabled={isUploading}
          className="w-full text-center border-2 border-dashed border-[var(--color-border-input)] hover:bg-[var(--color-bg-tertiary)] [font:inherit] disabled:opacity-60"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <Upload style={{ margin: "0 auto", height: "var(--icon-3xl)", width: "var(--icon-3xl)" }} color="var(--color-text-muted)" />
          <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-2)" }}>
            Drag and drop PDFs here, or click to select multiple files
          </Text>
          <Text size="xs" color="muted" style={{ marginTop: "var(--spacing-2)" }}>
            File name format: {'{id}_{rollNumber}.pdf'} · Max 10MB each
          </Text>
        </Surface>
        <FileInput
          ref={fileInputRef}
          accept="application/pdf,.pdf"
          multiple
          hidden
          disabled={isUploading}
          onChange={handleFileChange}
        />

        {items.length > 0 && (
          <VStack gap={3} align="stretch">
            <HStack align="center" justify="between">
              <Heading as="h3" size="md" weight="medium" color="secondary">
                {items.length} file{items.length === 1 ? "" : "s"}
              </Heading>
              <Text size="sm" color="muted">
                {counts.success} attached · {counts.failed} failed
              </Text>
            </HStack>

            {(isUploading || finished) && (
              <VStack gap={2} align="stretch">
                <Progress
                  value={progressValue}
                  max={progressMax}
                  showLabel
                  label={isUploading ? `Uploading ${Math.min(processedCount + 1, progressMax)} of ${progressMax}` : `${counts.success} of ${progressMax} attached`}
                  animate={isUploading}
                />
                {isUploading && (
                  <HStack align="center" gap={2}>
                    <Spinner size="var(--icon-md)" thickness="thin" />
                    <Text size="sm" color="muted">Processing one file at a time…</Text>
                  </HStack>
                )}
              </VStack>
            )}

            <div style={{ border: "var(--border-1) solid var(--color-border-light)", borderRadius: "var(--radius-lg)", overflow: "hidden", maxHeight: "20rem", overflowY: "auto" }}>
              {items.map((item) => (
                <HStack
                  key={item.id}
                  align="start"
                  justify="between"
                  gap={3}
                  style={{
                    padding: "var(--spacing-3) var(--spacing-4)",
                    borderBottom: "var(--border-1) solid var(--color-border-light)",
                  }}
                >
                  <HStack align="start" gap={3} style={{ minWidth: 0, flex: 1 }}>
                    {item.status === STATUS.UPLOADING ? (
                      <Spinner size="var(--icon-lg)" thickness="thin" />
                    ) : item.status === STATUS.SUCCESS ? (
                      <Check size={18} color="var(--color-success-text)" />
                    ) : item.status === STATUS.ERROR || item.status === STATUS.INVALID ? (
                      <CircleAlert size={18} color="var(--color-danger-text)" />
                    ) : (
                      <FileText size={18} color="var(--color-text-muted)" />
                    )}
                    <VStack gap="none" align="start" style={{ minWidth: 0 }}>
                      <Text size="sm" weight="medium" color="body" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "28rem" }}>
                        {item.fileName}
                      </Text>
                      <Text size="xs" color="muted">
                        {item.rollNumber ? `Roll ${item.rollNumber}` : "No roll number"} · {statusLabel(item)}
                      </Text>
                      {item.error && (
                        <Text size="xs" color="danger" style={{ marginTop: "var(--spacing-0-5)" }}>{item.error}</Text>
                      )}
                    </VStack>
                  </HStack>
                  {!isUploading && item.status !== STATUS.SUCCESS && (
                    <Button onClick={() => removeItem(item.id)} variant="ghost" size="sm" aria-label={`Remove ${item.fileName}`}>
                      <X size="1em" />
                    </Button>
                  )}
                </HStack>
              ))}
            </div>
          </VStack>
        )}

        {finished && counts.success > 0 && counts.failed === 0 && (
          <Alert type="success" title="All PDFs attached">
            {counts.success} student insurance document{counts.success === 1 ? " was" : "s were"} attached.
          </Alert>
        )}
        {finished && counts.failed > 0 && (
          <Alert type="warning" title="Some files were not attached">
            {counts.success} attached, {counts.failed} failed. You can retry failed uploads or remove them.
          </Alert>
        )}
      </VStack>

      <div style={{ marginTop: "var(--spacing-6)", display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)", paddingTop: "var(--spacing-4)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
        <Button onClick={handleClose} variant="secondary" size="md" disabled={isUploading}>
          {finished ? "Done" : "Cancel"}
        </Button>
        {finished && items.some((item) => item.status === STATUS.ERROR) && (
          <Button onClick={retryFailed} variant="secondary" size="md">
            Retry failed
          </Button>
        )}
        {!finished && (
          <Button onClick={handleUpload} variant="primary" size="md" loading={isUploading} disabled={isUploading || counts.ready === 0}>
            <Upload size="1em" /> {isUploading ? "Uploading…" : `Upload ${counts.ready} PDF${counts.ready === 1 ? "" : "s"}`}
          </Button>
        )}
      </div>
    </Modal>
  )
}

export default BulkInsurancePdfUploadModal
