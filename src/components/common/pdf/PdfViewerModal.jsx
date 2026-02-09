import { useEffect, useState } from "react"
import { FaFileAlt, FaExternalLinkAlt, FaDownload, FaSpinner } from "react-icons/fa"
import { Modal } from "@/components/ui"
import { Button } from "czero/react"

const PdfViewerModal = ({
  isOpen,
  onClose,
  documentUrl,
  title = "Document",
  subtitle = "PDF Document",
  downloadFileName = "document.pdf",
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fileType, setFileType] = useState("pdf")

  useEffect(() => {
    if (documentUrl && isOpen) {
      setIsLoading(true)
      setError(false)

      const url = documentUrl.toLowerCase()
      if (url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png")) {
        setFileType("image")
      } else {
        setFileType("pdf")
      }
    }
  }, [documentUrl, isOpen])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = documentUrl
    link.download = downloadFileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen || !documentUrl) return null

  return (
    <Modal title={title} onClose={onClose} width={900} fullHeight={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--spacing-4)", backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
            <div style={{ width: "var(--avatar-md)", height: "var(--avatar-md)", backgroundColor: "var(--color-primary-bg)", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaFileAlt style={{ width: "var(--icon-lg)", height: "var(--icon-lg)", color: "var(--color-primary)" }} />
            </div>
            <div>
              <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>{title}</h3>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{subtitle}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <Button onClick={handleDownload} variant="success" size="sm">
              <FaDownload /> Download
            </Button>
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", padding: "var(--spacing-2) var(--spacing-3)", backgroundColor: "var(--color-primary)", color: "var(--color-white)", borderRadius: "var(--radius-lg)", fontSize: "var(--font-size-sm)", textDecoration: "none", transition: "var(--transition-colors)" }}
              onMouseOver={(event) => {
                event.currentTarget.style.backgroundColor = "var(--color-primary-hover)"
              }}
              onMouseOut={(event) => {
                event.currentTarget.style.backgroundColor = "var(--color-primary)"
              }}
            >
              <FaExternalLinkAlt style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        <div style={{ flex: "1", backgroundColor: "var(--color-bg-primary)", border: "var(--border-2) solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", overflow: "hidden", height: "calc(100% - 100px)" }}>
          {fileType === "image" ? (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4)" }}>
              <img
                src={documentUrl}
                alt={title}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError(true)
                  setIsLoading(false)
                }}
              />
            </div>
          ) : (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              {isLoading && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg-tertiary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                    <FaSpinner style={{ width: "var(--icon-lg)", height: "var(--icon-lg)", color: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
                    <span style={{ color: "var(--color-text-muted)" }}>Loading document...</span>
                  </div>
                </div>
              )}

              <object
                data={documentUrl}
                type="application/pdf"
                style={{ width: "100%", height: "100%" }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError(true)
                  setIsLoading(false)
                }}
              >
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--spacing-8)", textAlign: "center" }}>
                  <FaFileAlt style={{ width: "var(--icon-4xl)", height: "var(--icon-4xl)", color: "var(--color-text-placeholder)", marginBottom: "var(--spacing-4)" }} />
                  <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>
                    Cannot display PDF in browser
                  </h3>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-6)" }}>
                    Your browser doesn't support embedded PDFs. Please download the file or open it in a new tab.
                  </p>
                  <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
                    <Button onClick={handleDownload} variant="success" size="md">
                      <FaDownload /> Download PDF
                    </Button>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", padding: "var(--spacing-2) var(--spacing-4)", backgroundColor: "var(--color-primary)", color: "var(--color-white)", borderRadius: "var(--radius-lg)", textDecoration: "none", transition: "var(--transition-colors)" }}
                      onMouseOver={(event) => {
                        event.currentTarget.style.backgroundColor = "var(--color-primary-hover)"
                      }}
                      onMouseOut={(event) => {
                        event.currentTarget.style.backgroundColor = "var(--color-primary)"
                      }}
                    >
                      <FaExternalLinkAlt style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
                      <span>Open in New Tab</span>
                    </a>
                  </div>
                </div>
              </object>
            </div>
          )}
        </div>

        {error && (
          <div style={{ textAlign: "center", paddingTop: "var(--spacing-4)", paddingBottom: "var(--spacing-4)" }}>
            <div style={{ backgroundColor: "var(--color-danger-bg-light)", border: "var(--border-1) solid var(--color-danger-border)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-4)" }}>
              <p style={{ color: "var(--color-danger-text)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>
                Unable to load document
              </p>
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-4)" }}>
                There was an error loading the document. Please try downloading it instead.
              </p>
              <Button onClick={handleDownload} variant="danger" size="md">
                <FaDownload /> Download Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PdfViewerModal
