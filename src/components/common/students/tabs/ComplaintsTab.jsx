import React, { useState, useEffect } from "react"
import { FaClipboardList } from "react-icons/fa"
import { studentApi } from "../../../../services/apiService"
import ComplaintDetailModal from "../../../complaints/ComplaintDetailModal"

const ComplaintsTab = ({ userId }) => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const fetchStudentComplaints = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const response = await studentApi.getStudentComplaints(userId, { limit: 10 })
      setComplaints(response.data || [])
    } catch (error) {
      console.error("Error fetching student complaints:", error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentComplaints()
  }, [userId])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case "Pending":
        return {
          backgroundColor: "var(--color-warning-bg)",
          color: "var(--color-warning-text)",
        }
      case "In Progress":
        return {
          backgroundColor: "var(--color-info-bg)",
          color: "var(--color-info-text)",
        }
      case "Resolved":
        return {
          backgroundColor: "var(--color-success-bg)",
          color: "var(--color-success-text)",
        }
      default:
        return {
          backgroundColor: "var(--color-danger-bg)",
          color: "var(--color-danger-text)",
        }
    }
  }

  const styles = {
    container: {
      backgroundColor: "var(--color-bg-primary)",
    },
    title: {
      fontSize: "var(--font-size-lg)",
      fontWeight: "var(--font-weight-semibold)",
      color: "var(--color-text-body)",
      marginBottom: "var(--spacing-4)",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      padding: "var(--spacing-10) 0",
    },
    spinner: {
      width: "var(--avatar-sm)",
      height: "var(--avatar-sm)",
      borderRadius: "var(--radius-full)",
      borderBottom: "var(--border-2) solid var(--color-primary)",
      animation: "spin 1s linear infinite",
    },
    emptyState: {
      textAlign: "center",
      padding: "var(--spacing-10) 0",
      backgroundColor: "var(--color-bg-tertiary)",
      borderRadius: "var(--radius-lg)",
    },
    emptyIcon: {
      margin: "0 auto",
      color: "var(--color-text-disabled)",
      marginBottom: "var(--spacing-2)",
      fontSize: "var(--font-size-4xl)",
    },
    emptyText: {
      color: "var(--color-text-muted)",
      fontSize: "var(--font-size-base)",
    },
    tableContainer: {
      overflowX: "auto",
    },
    table: {
      minWidth: "100%",
      borderCollapse: "collapse",
    },
    thead: {
      backgroundColor: "var(--color-bg-tertiary)",
    },
    th: {
      padding: "var(--spacing-3) var(--spacing-6)",
      textAlign: "left",
      fontSize: "var(--font-size-xs)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-text-muted)",
      textTransform: "uppercase",
      letterSpacing: "var(--letter-spacing-wider)",
    },
    tbody: {
      backgroundColor: "var(--color-bg-primary)",
    },
    tr: {
      borderTop: "var(--border-1) solid var(--color-border-primary)",
      cursor: "pointer",
      transition: "var(--transition-all)",
    },
    td: {
      padding: "var(--spacing-4) var(--spacing-6)",
      whiteSpace: "nowrap",
      fontSize: "var(--font-size-sm)",
    },
    tdText: {
      color: "var(--color-text-muted)",
    },
    tdTitle: {
      color: "var(--color-text-primary)",
      fontWeight: "var(--font-weight-medium)",
    },
    statusBadge: {
      padding: "var(--spacing-0-5) var(--spacing-2)",
      display: "inline-flex",
      fontSize: "var(--font-size-xs)",
      lineHeight: "var(--line-height-tight)",
      fontWeight: "var(--font-weight-semibold)",
      borderRadius: "var(--radius-full)",
    },
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Complaints History</h3>
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
      ) : complaints.length === 0 ? (
        <div style={styles.emptyState}>
          <FaClipboardList style={styles.emptyIcon} />
          <p style={styles.emptyText}>No complaints found for this student</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody style={styles.tbody}>
              {complaints.map((complaint) => (
                <tr onClick={() => handleComplaintClick(complaint)}
                  key={complaint._id}
                  style={styles.tr}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-bg-primary)"
                  }}
                >
                  <td style={{ ...styles.td, ...styles.tdText }}>{formatDate(complaint.createdDate)}</td>
                  <td style={{ ...styles.td, ...styles.tdTitle }}>{complaint.title}</td>
                  <td style={{ ...styles.td, ...styles.tdText }}>{complaint.category}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, ...getStatusStyles(complaint.status) }}>{complaint.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showDetailModal && selectedComplaint && <ComplaintDetailModal selectedComplaint={selectedComplaint} setShowDetailModal={setShowDetailModal} onComplaintUpdate={fetchStudentComplaints} />}
    </div>
  )
}

export default ComplaintsTab
