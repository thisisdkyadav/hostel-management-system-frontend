import React, { useState, useEffect } from "react"
import { FaFileAlt, FaExternalLinkAlt, FaDownload, FaSpinner } from "react-icons/fa"
import { Button, Modal } from "@/components/ui"

const H2FormViewerModal = ({ isOpen, onClose, h2FormUrl }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fileType, setFileType] = useState(null)

  useEffect(() => {
    if (h2FormUrl && isOpen) {
      setIsLoading(true)
      setError(false)

      // Determine file type from URL or extension
      const url = h2FormUrl.toLowerCase()
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
    link.href = h2FormUrl
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <div style={{ width: 'var(--avatar-md)', height: 'var(--avatar-md)', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaFileAlt style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>H2 Form Document</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Guest Room Booking Form</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button onClick={handleDownload} variant="success" size="small" icon={<FaDownload />}>
              Download
            </Button>
            <a href={h2FormUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-3)', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', textDecoration: 'none', transition: 'var(--transition-colors)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            >
              <FaExternalLinkAlt style={{ width: 'var(--icon-md)', height: 'var(--icon-md)' }} />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        {/* Document Viewer */}
        <div style={{ flex: '1', backgroundColor: 'var(--color-bg-primary)', border: `var(--border-2) solid var(--color-border-primary)`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 'calc(100% - 100px)' }}>
          {fileType === "image" ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4)' }}>
              <img src={h2FormUrl} alt="H2 Form Document" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onLoad={() => setIsLoading(false)}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                    <FaSpinner style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: 'var(--color-text-muted)' }}>Loading document...</span>
                  </div>
                </div>
              )}

              <object data={h2FormUrl} type="application/pdf" style={{ width: '100%', height: '100%' }} onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError(true)
                  setIsLoading(false)
                }}
              >
                {/* Fallback for when PDF object fails */}
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-8)', textAlign: 'center' }}>
                  <FaFileAlt style={{ width: 'var(--icon-4xl)', height: 'var(--icon-4xl)', color: 'var(--color-text-placeholder)', marginBottom: 'var(--spacing-4)' }} />
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-2)' }}>Cannot display PDF in browser</h3>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>Your browser doesn't support embedded PDFs. Please download the file or open it in a new tab.</p>
                  <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                    <Button onClick={handleDownload} variant="success" size="medium" icon={<FaDownload />}>
                      Download PDF
                    </Button>
                    <a href={h2FormUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius-lg)', textDecoration: 'none', transition: 'var(--transition-colors)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                    >
                      <FaExternalLinkAlt style={{ width: 'var(--icon-md)', height: 'var(--icon-md)' }} />
                      <span>Open in New Tab</span>
                    </a>
                  </div>
                </div>
              </object>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)' }}>
            <div style={{ backgroundColor: 'var(--color-danger-bg-light)', border: `var(--border-1) solid var(--color-danger-border)`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-4)' }}>
              <p style={{ color: 'var(--color-danger-text)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>Unable to load document</p>
              <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>There was an error loading the document. Please try downloading it instead.</p>
              <Button onClick={handleDownload} variant="danger" size="medium" icon={<FaDownload />}>
                Download Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default H2FormViewerModal
