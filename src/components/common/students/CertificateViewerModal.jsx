import React, { useState, useEffect } from "react"
import Modal from "../../common/Modal"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { FaFileAlt, FaExternalLinkAlt, FaDownload, FaSpinner } from "react-icons/fa"

const CertificateViewerModal = ({ isOpen, onClose, certificateUrl }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fileType, setFileType] = useState(null)

  useEffect(() => {
    if (certificateUrl && isOpen) {
      setIsLoading(true)
      setError(false)

      // Determine file type from URL or extension
      const url = certificateUrl.toLowerCase()
      if (url.includes(".pdf") || url.includes("pdf")) {
        setFileType("pdf")
      } else if (url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png") || url.includes(".gif") || url.includes(".webp")) {
        setFileType("image")
      } else {
        setFileType("pdf") // Default to PDF
      }
    }
  }, [certificateUrl, isOpen])

  const handleDownload = () => {
    const fullUrl = getMediaUrl(certificateUrl)
    const link = document.createElement("a")
    link.href = fullUrl
    link.download = certificateUrl.split("/").pop() || "certificate"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-4)",
      height: "100%",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "var(--spacing-4)",
      backgroundColor: "var(--color-bg-tertiary)",
      borderRadius: "var(--radius-lg)",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-3)",
    },
    iconWrapper: {
      width: "var(--avatar-md)",
      height: "var(--avatar-md)",
      backgroundColor: "var(--color-primary-bg)",
      borderRadius: "var(--radius-full)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    icon: {
      width: "var(--icon-lg)",
      height: "var(--icon-lg)",
      color: "var(--color-primary)",
    },
    headerTitle: {
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-text-secondary)",
      fontSize: "var(--font-size-base)",
    },
    headerSubtitle: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-muted)",
    },
    headerActions: {
      display: "flex",
      gap: "var(--spacing-2)",
    },
    downloadButton: {
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-2)",
      padding: "var(--spacing-2) var(--spacing-3)",
      backgroundColor: "var(--color-success)",
      color: "var(--color-white)",
      borderRadius: "var(--radius-lg)",
      border: "none",
      cursor: "pointer",
      transition: "var(--transition-all)",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
    },
    openButton: {
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-2)",
      padding: "var(--spacing-2) var(--spacing-3)",
      backgroundColor: "var(--color-primary)",
      color: "var(--color-white)",
      borderRadius: "var(--radius-lg)",
      textDecoration: "none",
      transition: "var(--transition-all)",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
    },
    buttonIcon: {
      width: "var(--icon-md)",
      height: "var(--icon-md)",
    },
    viewerContainer: {
      flex: 1,
      backgroundColor: "var(--color-bg-primary)",
      border: "var(--border-2) solid var(--color-border-primary)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      height: "calc(100% - 100px)",
    },
    imageContainer: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--spacing-4)",
      overflow: "auto",
    },
    image: {
      width: "100%",
      height: "auto",
      objectFit: "contain",
    },
    pdfContainer: {
      width: "100%",
      height: "100%",
      position: "relative",
    },
    loadingOverlay: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--color-bg-tertiary)",
    },
    loadingContent: {
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-3)",
    },
    spinnerIcon: {
      width: "var(--icon-lg)",
      height: "var(--icon-lg)",
      color: "var(--color-primary)",
      animation: "spin 1s linear infinite",
    },
    loadingText: {
      color: "var(--color-text-muted)",
      fontSize: "var(--font-size-base)",
    },
    pdfObject: {
      width: "100%",
      height: "100%",
    },
    fallbackContainer: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--spacing-8)",
      textAlign: "center",
    },
    fallbackIcon: {
      width: "var(--icon-4xl)",
      height: "var(--icon-4xl)",
      color: "var(--color-text-disabled)",
      marginBottom: "var(--spacing-4)",
    },
    fallbackTitle: {
      fontSize: "var(--font-size-lg)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-text-body)",
      marginBottom: "var(--spacing-2)",
    },
    fallbackText: {
      color: "var(--color-text-muted)",
      marginBottom: "var(--spacing-6)",
      fontSize: "var(--font-size-base)",
    },
    fallbackActions: {
      display: "flex",
      gap: "var(--spacing-3)",
    },
    fallbackDownloadButton: {
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-2)",
      padding: "var(--spacing-2) var(--spacing-4)",
      backgroundColor: "var(--color-success)",
      color: "var(--color-white)",
      borderRadius: "var(--radius-lg)",
      border: "none",
      cursor: "pointer",
      transition: "var(--transition-all)",
      fontSize: "var(--font-size-base)",
      fontWeight: "var(--font-weight-medium)",
    },
    fallbackOpenButton: {
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-2)",
      padding: "var(--spacing-2) var(--spacing-4)",
      backgroundColor: "var(--color-primary)",
      color: "var(--color-white)",
      borderRadius: "var(--radius-lg)",
      textDecoration: "none",
      transition: "var(--transition-all)",
      fontSize: "var(--font-size-base)",
      fontWeight: "var(--font-weight-medium)",
    },
    errorContainer: {
      textAlign: "center",
      padding: "var(--spacing-4) 0",
    },
    errorBox: {
      backgroundColor: "var(--color-danger-bg-light)",
      border: "var(--border-1) solid var(--color-danger-border)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--spacing-4)",
    },
    errorTitle: {
      color: "var(--color-danger-text)",
      fontWeight: "var(--font-weight-medium)",
      marginBottom: "var(--spacing-2)",
      fontSize: "var(--font-size-base)",
    },
    errorText: {
      color: "var(--color-danger)",
      fontSize: "var(--font-size-sm)",
      marginBottom: "var(--spacing-4)",
    },
    errorButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--spacing-2)",
      padding: "var(--spacing-2) var(--spacing-4)",
      backgroundColor: "var(--color-danger)",
      color: "var(--color-white)",
      borderRadius: "var(--radius-lg)",
      border: "none",
      cursor: "pointer",
      transition: "var(--transition-all)",
      fontSize: "var(--font-size-base)",
      fontWeight: "var(--font-weight-medium)",
    },
  }

  if (!isOpen || !certificateUrl) return null

  const fullUrl = getMediaUrl(certificateUrl)

  return (
    <Modal title="Certificate Document" onClose={onClose} width={900} fullHeight={true}>
      <div style={styles.container}>
        {/* Header with action buttons */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconWrapper}>
              <FaFileAlt style={styles.icon} />
            </div>
            <div>
              <h3 style={styles.headerTitle}>Certificate Document</h3>
              <p style={styles.headerSubtitle}>Issued Certificate</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={handleDownload}
              style={styles.downloadButton}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--color-success-hover)")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--color-success)")}
            >
              <FaDownload style={styles.buttonIcon} />
              <span>Download</span>
            </button>
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.openButton}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--color-primary-hover)")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--color-primary)")}
            >
              <FaExternalLinkAlt style={styles.buttonIcon} />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        {/* Document Viewer */}
        <div style={styles.viewerContainer}>
          {fileType === "image" ? (
            <div style={styles.imageContainer}>
              <img
                src={fullUrl}
                alt="Certificate Document"
                style={styles.image}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError(true)
                  setIsLoading(false)
                }}
              />
            </div>
          ) : (
            // For PDF files, we'll use object tag with fallback
            <div style={styles.pdfContainer}>
              {isLoading && (
                <div style={styles.loadingOverlay}>
                  <div style={styles.loadingContent}>
                    <FaSpinner style={styles.spinnerIcon} />
                    <span style={styles.loadingText}>Loading document...</span>
                  </div>
                </div>
              )}

              <object
                data={fullUrl}
                type="application/pdf"
                style={styles.pdfObject}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError(true)
                  setIsLoading(false)
                }}
              >
                {/* Fallback for when PDF object fails */}
                <div style={styles.fallbackContainer}>
                  <FaFileAlt style={styles.fallbackIcon} />
                  <h3 style={styles.fallbackTitle}>Cannot display PDF in browser</h3>
                  <p style={styles.fallbackText}>Your browser doesn't support embedded PDFs. Please download the file or open it in a new tab.</p>
                  <div style={styles.fallbackActions}>
                    <button
                      onClick={handleDownload}
                      style={styles.fallbackDownloadButton}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--color-success-hover)")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--color-success)")}
                    >
                      <FaDownload style={styles.buttonIcon} />
                      <span>Download PDF</span>
                    </button>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.fallbackOpenButton}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--color-primary-hover)")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--color-primary)")}
                    >
                      <FaExternalLinkAlt style={styles.buttonIcon} />
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
          <div style={styles.errorContainer}>
            <div style={styles.errorBox}>
              <p style={styles.errorTitle}>Unable to load document</p>
              <p style={styles.errorText}>There was an error loading the document. Please try downloading it instead.</p>
              <button
                onClick={handleDownload}
                style={styles.errorButton}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--color-danger-hover)")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--color-danger)")}
              >
                <FaDownload style={styles.buttonIcon} />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default CertificateViewerModal
