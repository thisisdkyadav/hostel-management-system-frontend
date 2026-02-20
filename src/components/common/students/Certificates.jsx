import React, { useEffect, useState } from "react"
import { Plus, FileText, FileType, Image } from "lucide-react"
import { certificateApi } from "../../../service"
import useAuthz from "../../../hooks/useAuthz"
import { Button } from "czero/react"
import CertificateModal from "./CertificateModal"
import CertificateViewerModal from "./CertificateViewerModal"

const Certificates = ({ userId }) => {
  const { can } = useAuthz()
  const canManageCertificates = can("cap.students.certificates.manage")
  const [certificates, setCertificates] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCertificate, setCurrentCertificate] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewerModalOpen, setViewerModalOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState(null)

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const res = await certificateApi.getCertificatesByStudent(userId)
      setCertificates(res.certificates)
    } catch (err) {
      setError(err)
      console.error("Failed to fetch certificates:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchCertificates()
    }
  }, [userId])

  const handleAddClick = () => {
    setCurrentCertificate(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditClick = (certificate) => {
    setCurrentCertificate(certificate)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleViewClick = (certificateUrl) => {
    setViewerUrl(certificateUrl)
    setViewerModalOpen(true)
  }

  const handleDeleteClick = async (certificateId) => {
    try {
      await certificateApi.deleteCertificate(certificateId)
      fetchCertificates() // Refresh the list
    } catch (error) {
      console.error("Error deleting certificate:", error)
      alert("Failed to delete certificate")
    }
  }

  const handleModalSubmit = async (formData) => {
    try {
      await formData.onSubmit()
      fetchCertificates() // Refresh the list
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving certificate:", error)
      throw error
    }
  }

  const getFileIcon = (url) => {
    if (!url) return <FileText size={24} style={{ color: "var(--color-text-muted)" }} />
    const urlLower = url.toLowerCase()
    if (urlLower.endsWith(".pdf")) {
      return <FileType size={24} style={{ color: "var(--color-danger)" }} />
    } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return <Image size={24} style={{ color: "var(--color-primary)" }} />
    }
    return <FileText size={24} style={{ color: "var(--color-text-muted)" }} />
  }

  const styles = {
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "var(--spacing-8)",
    },
    spinner: {
      width: "var(--avatar-sm)",
      height: "var(--avatar-sm)",
      border: "var(--border-4) solid transparent",
      borderTopColor: "var(--color-primary)",
      borderRadius: "var(--radius-full)",
      animation: "spin 1s linear infinite",
    },
    errorContainer: {
      padding: "var(--spacing-4)",
      backgroundColor: "var(--color-danger-bg-light)",
      color: "var(--color-danger)",
      borderRadius: "var(--radius-lg)",
      fontSize: "var(--font-size-base)",
    },
    container: {
      padding: "0 var(--spacing-4)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "var(--spacing-6)",
    },
    title: {
      fontSize: "var(--font-size-lg)",
      color: "var(--color-text-body)",
      fontWeight: "var(--font-weight-semibold)",
    },
    emptyState: {
      backgroundColor: "var(--color-bg-tertiary)",
      padding: "var(--spacing-8)",
      textAlign: "center",
      borderRadius: "var(--radius-lg)",
      border: "var(--border-1) solid var(--color-border-primary)",
    },
    emptyText: {
      color: "var(--color-text-muted)",
      fontSize: "var(--font-size-base)",
    },
    emptyAddButton: {
      marginTop: "var(--spacing-3)",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: "var(--spacing-4)",
    },
    card: {
      backgroundColor: "var(--color-bg-primary)",
      border: "var(--border-1) solid var(--color-border-primary)",
      padding: "var(--spacing-4)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      transition: "var(--transition-all)",
    },
    cardContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    cardLeft: {
      display: "flex",
      alignItems: "flex-start",
      flex: 1,
    },
    fileIcon: {
      fontSize: "var(--font-size-3xl)",
      marginRight: "var(--spacing-3)",
      marginTop: "var(--spacing-1)",
    },
    cardDetails: {
      flex: 1,
    },
    cardTitleRow: {
      display: "flex",
      alignItems: "center",
    },
    cardTitle: {
      fontSize: "var(--font-size-md)",
      fontWeight: "var(--font-weight-semibold)",
      color: "var(--color-text-secondary)",
    },
    dateBadge: {
      marginLeft: "var(--spacing-2)",
      padding: "var(--spacing-0-5) var(--spacing-2)",
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
      fontSize: "var(--font-size-xs)",
      borderRadius: "var(--radius-full)",
    },
    remarks: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-body)",
      marginTop: "var(--spacing-2)",
    },
    remarksLabel: {
      fontWeight: "var(--font-weight-semibold)",
      color: "var(--color-text-secondary)",
    },
    cardActions: {
      display: "flex",
      gap: "var(--spacing-2)",
    },
    viewButton: {
      padding: "var(--spacing-1) var(--spacing-3)",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-success)",
      backgroundColor: "var(--color-success-bg-light)",
      borderRadius: "var(--radius-md)",
      transition: "var(--transition-all)",
      border: "none",
      cursor: "pointer",
    },
    editButton: {
      padding: "var(--spacing-1) var(--spacing-3)",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-primary)",
      backgroundColor: "var(--color-primary-bg)",
      borderRadius: "var(--radius-md)",
      transition: "var(--transition-all)",
      border: "none",
      cursor: "pointer",
    },
  }

  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    )
  if (error) return <div style={styles.errorContainer}>Error: {error.message}</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Certificates Issued</h3>
        {canManageCertificates && (
          <Button variant="primary" size="sm" onClick={handleAddClick}>
            <Plus size={16} />
            Add Certificate
          </Button>
        )}
      </div>

      {certificates.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No certificates found.</p>
          {canManageCertificates && (
            <div style={styles.emptyAddButton}>
              <Button variant="secondary" size="sm" onClick={handleAddClick}>
                Add Certificate
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {certificates.map((certificate) => (
            <div key={certificate._id} style={styles.card} onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-md)"
            }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-sm)"
              }}
            >
              <div style={styles.cardContent}>
                <div style={styles.cardLeft}>
                  <div style={styles.fileIcon}>{getFileIcon(certificate.certificateUrl)}</div>
                  <div style={styles.cardDetails}>
                    <div style={styles.cardTitleRow}>
                      <h4 style={styles.cardTitle}>{certificate.certificateType}</h4>
                      <span style={styles.dateBadge}>{new Date(certificate.issueDate).toLocaleDateString()}</span>
                    </div>
                    {certificate.remarks && (
                      <p style={styles.remarks}>
                        <span style={styles.remarksLabel}>Remarks:</span> {certificate.remarks}
                      </p>
                    )}
                  </div>
                </div>
                <div style={styles.cardActions}>
                  <Button onClick={() => handleViewClick(certificate.certificateUrl)} variant="success" size="sm">
                    View
                  </Button>
                  {canManageCertificates && (
                    <Button onClick={() => handleEditClick(certificate)} variant="secondary" size="sm">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && <CertificateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} initialData={currentCertificate} isEditing={isEditing} onDelete={isEditing ? handleDeleteClick : null} studentId={userId} />}

      {viewerModalOpen && <CertificateViewerModal isOpen={viewerModalOpen} onClose={() => setViewerModalOpen(false)} certificateUrl={viewerUrl} />}
    </div>
  )
}

export default Certificates
