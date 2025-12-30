import React, { useState, useEffect } from "react"
import { FaQrcode, FaHistory } from "react-icons/fa"
import AttendanceQRScanner from "../../components/guard/AttendanceQRScanner"
import { securityApi } from "../../service"

const HostelGateAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true)
      // Fetch staff attendance records
      const response = await securityApi.getStaffAttendanceRecords()
      setAttendanceRecords(response.success ? response.records : [])
    } catch (error) {
      console.error("Error fetching attendance records:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceRecords()
  }, [])

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getRoleBadgeStyles = (role) => {
    if (role === "Security") {
      return {
        backgroundColor: "var(--color-purple-light-bg)",
        color: "var(--color-purple-text)",
      }
    }
    return {
      backgroundColor: "var(--color-info-bg)",
      color: "var(--color-info-text)",
    }
  }

  const getStatusBadgeStyles = (type) => {
    if (type === "checkIn") {
      return {
        backgroundColor: "var(--color-success-bg)",
        color: "var(--color-success-text)",
      }
    }
    return {
      backgroundColor: "var(--color-danger-bg)",
      color: "var(--color-danger-text)",
    }
  }

  const styles = {
    container: {
      padding: "var(--spacing-6) var(--spacing-4)",
    },
    containerResponsive: {
      maxWidth: "var(--container-xl)",
      margin: "0 auto",
    },
    header: {
      marginBottom: "var(--spacing-6)",
    },
    title: {
      fontSize: "var(--font-size-3xl)",
      fontWeight: "var(--font-weight-bold)",
      color: "var(--color-text-secondary)",
      marginBottom: "var(--spacing-2)",
    },
    subtitle: {
      fontSize: "var(--font-size-base)",
      color: "var(--color-text-muted)",
    },
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "var(--spacing-6)",
    },
    card: {
      backgroundColor: "var(--color-bg-primary)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--spacing-6)",
      boxShadow: "var(--shadow-sm)",
      transition: "var(--transition-all)",
      border: "var(--border-1) solid var(--color-border-light)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "var(--spacing-4)",
    },
    cardIconWrapper: {
      padding: "var(--spacing-2-5)",
      marginRight: "var(--spacing-3)",
      borderRadius: "var(--radius-xl)",
      backgroundColor: "var(--color-info-bg)",
      color: "var(--color-primary)",
    },
    cardTitle: {
      fontSize: "var(--font-size-2xl)",
      fontWeight: "var(--font-weight-bold)",
      color: "var(--color-text-secondary)",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "var(--spacing-12)",
    },
    spinner: {
      width: "var(--icon-4xl)",
      height: "var(--icon-4xl)",
      border: "var(--border-4) solid var(--color-primary)",
      borderTop: "var(--border-4) solid transparent",
      borderRadius: "var(--radius-full)",
      animation: "spin 1s linear infinite",
    },
    tableContainer: {
      overflowX: "auto",
    },
    table: {
      minWidth: "100%",
      borderCollapse: "collapse",
    },
    thead: {
      backgroundColor: "var(--table-header-bg)",
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
    td: {
      padding: "var(--spacing-4) var(--spacing-6)",
      whiteSpace: "nowrap",
      borderBottom: "var(--border-1) solid var(--color-border-primary)",
    },
    nameText: {
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      color: "var(--color-text-primary)",
    },
    emailText: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-muted)",
    },
    badge: {
      padding: "var(--spacing-0-5) var(--spacing-2)",
      display: "inline-flex",
      fontSize: "var(--font-size-xs)",
      lineHeight: "var(--line-height-snug)",
      fontWeight: "var(--font-weight-semibold)",
      borderRadius: "var(--radius-full)",
    },
    timeText: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-muted)",
    },
    emptyState: {
      textAlign: "center",
      padding: "var(--spacing-8)",
    },
    emptyText: {
      color: "var(--color-text-muted)",
      fontSize: "var(--font-size-base)",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.containerResponsive}>
        <div style={styles.header}>
          <h1 style={styles.title}>Staff Attendance Scanner</h1>
          <p style={styles.subtitle}>Scan QR codes to record attendance for security guards and maintenance staff.</p>
        </div>

        <div style={styles.gridContainer} className="grid-cols-attendance">
          <div>
            <AttendanceQRScanner onRefresh={fetchAttendanceRecords} />
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrapper}>
                <FaHistory size={20} />
              </div>
              <h2 style={styles.cardTitle}>Recent Staff Attendance Records</h2>
            </div>

            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
              </div>
            ) : attendanceRecords.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead style={styles.thead}>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Time</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody style={styles.tbody}>
                    {attendanceRecords.map((record) => (
                      <tr key={record._id}>
                        <td style={styles.td}>
                          <div style={styles.nameText}>{record.userId.name}</div>
                          <div style={styles.emailText}>{record.userId.email}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, ...getRoleBadgeStyles(record.userId.role) }}>{record.userId.role}</span>
                        </td>
                        <td style={{ ...styles.td, ...styles.timeText }}>{formatDate(record.createdAt)}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, ...getStatusBadgeStyles(record.type) }}>{record.type === "checkIn" ? "Check In" : "Check Out"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No attendance records found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .grid-cols-attendance {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-6);
        }
        @media (min-width: 1024px) {
          .grid-cols-attendance {
            grid-template-columns: 1fr 2fr;
          }
        }
      `}</style>
    </div>
  )
}

export default HostelGateAttendance
