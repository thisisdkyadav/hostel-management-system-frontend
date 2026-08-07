import React, { useState, useEffect } from "react"
import { FaFileAlt, FaExternalLinkAlt, FaDownload, FaSpinner } from "react-icons/fa"
import { Heading, HStack, IconCircle, Modal, Surface, Text } from "@/components/ui"
import { Button } from "hzero"
import { getMediaDownloadUrl, getMediaUrl } from "../../../utils/mediaUtils"

const H2FormViewerModal = ({ isOpen, onClose, h2FormUrl }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fileType, setFileType] = useState(null)
  const resolvedH2FormUrl = getMediaUrl(h2FormUrl)
  const resolvedH2FormDownloadUrl = getMediaDownloadUrl(h2FormUrl)

  useEffect(() => {
    if (h2FormUrl && isOpen) {
      setIsLoading(true)
      setError(false)

      // Determine file type from URL or extension
      const url = String(h2FormUrl || "").toLowerCase()
      if (url.includes(".pdf") || url.includes("pdf")) {
        setFileType("pdf")
      } else if (url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png")) {
        setFileType("image")
      } else {
        setFileType("pdf") // Default to PDF
      }
    }
  }, [h2FormUrl, isOpen])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = resolvedH2FormDownloadUrl
    link.download = "H2_Form.pdf"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen || !h2FormUrl) return null

  return (
    <Modal title="H2 Form Document" onClose={onClose} width={900} fullHeight={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', height: '100%' }}>
        {/* Header with action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
          <HStack gap={3} align="center">
            <IconCircle size="var(--avatar-md)" bg="brand">
              <FaFileAlt style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)' }} color="var(--color-primary)" />
            </IconCircle>
            <div>
              <Heading as="h3" weight="medium" color="secondary">H2 Form Document</Heading>
              <Text size="sm" color="muted">Guest Room Booking Form</Text>
            </div>
          </HStack>
          <HStack gap={2}>
            <Button onClick={handleDownload} variant="success" size="sm">
              <FaDownload /> Download
            </Button>
            <a href={resolvedH2FormUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-3)', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', textDecoration: 'none', transition: 'var(--transition-colors)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            >
              <FaExternalLinkAlt style={{ width: 'var(--icon-md)', height: 'var(--icon-md)' }} />
              <span>Open in New Tab</span>
            </a>
          </HStack>
        </div>

        {/* Document Viewer */}
        <div style={{ flex: '1', backgroundColor: 'var(--color-bg-primary)', border: `var(--border-2) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 'calc(100% - 100px)' }}>
          {fileType === "image" ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4)' }}>
              <img src={resolvedH2FormUrl} alt="H2 Form Document" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError(true)
                  setIsLoading(false)
                }}
              />
            </div>
          ) : (
            // For PDF files, we'll use object tag with fallback
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {isLoading && (
                <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <HStack gap={3} align="center">
                    <FaSpinner style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', animation: 'spin 1s linear infinite' }} color="var(--color-primary)" />
                    <Text as="span" color="muted">Loading document...</Text>
                  </HStack>
                </div>
              )}

              <object data={resolvedH2FormUrl} type="application/pdf" style={{ width: '100%', height: '100%' }} onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError(true)
                  setIsLoading(false)
                }}
              >
                {/* Fallback for when PDF object fails */}
                <Surface padding={8} align="center" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <FaFileAlt style={{ width: 'var(--icon-4xl)', height: 'var(--icon-4xl)', marginBottom: 'var(--spacing-4)' }} color="var(--color-text-placeholder)" />
                  <Heading as="h3" size="lg" weight="medium" color="body" style={{ marginBottom: 'var(--spacing-2)' }}>Cannot display PDF in browser</Heading>
                  <Text color="muted" style={{ marginBottom: 'var(--spacing-6)' }}>Your browser doesn't support embedded PDFs. Please download the file or open it in a new tab.</Text>
                  <HStack gap={3}>
                    <Button onClick={handleDownload} variant="success" size="md">
                      <FaDownload /> Download PDF
                    </Button>
                    <a href={resolvedH2FormUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', textDecoration: 'none', transition: 'var(--transition-colors)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                    >
                      <FaExternalLinkAlt style={{ width: 'var(--icon-md)', height: 'var(--icon-md)' }} />
                      <span>Open in New Tab</span>
                    </a>
                  </HStack>
                </Surface>
              </object>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)' }}>
            <Surface bg="var(--color-danger-bg-light)" padding={4} radius="lg" border="var(--border-1) solid var(--color-danger-border)">
              <Text color="danger-text" weight="medium" style={{ marginBottom: 'var(--spacing-2)' }}>Unable to load document</Text>
              <Text color="danger" size="sm" style={{ marginBottom: 'var(--spacing-4)' }}>There was an error loading the document. Please try downloading it instead.</Text>
              <Button onClick={handleDownload} variant="danger" size="md">
                <FaDownload /> Download Document
              </Button>
            </Surface>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default H2FormViewerModal
