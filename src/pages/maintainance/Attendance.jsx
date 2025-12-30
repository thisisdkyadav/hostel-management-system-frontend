import React, { useState, useEffect } from "react"
import { FaQrcode, FaHistory } from "react-icons/fa"
import MaintenanceQRGenerator from "../../components/guard/MaintenanceQRGenerator"
import { securityApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"

const MaintenanceAttendance = () => {
  const { user } = useAuth()
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        setLoading(true)
        const response = await securityApi.getStaffAttendanceRecords({ staffType: "maintenance", userId: user?._id })
        const records = response.success ? response.records : []
        const processedData = processAttendanceRecords(records)
        setAttendanceHistory(processedData)
      } catch (error) {
        console.error("Error fetching attendance history:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAttendanceHistory()
  }, [user])

  const processAttendanceRecords = (records) => {
    const groupedByDate = {}
    records.forEach((record) => {
      const date = new Date(record.createdAt).toLocaleDateString()
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date: new Date(record.createdAt), checkIn: null, checkOut: null, status: "Absent" }
      }
      if (record.type === "checkIn") {
        groupedByDate[date].checkIn = new Date(record.createdAt)
        groupedByDate[date].status = "Present"
      } else if (record.type === "checkOut") {
        groupedByDate[date].checkOut = new Date(record.createdAt)
      }
    })
    return Object.values(groupedByDate).sort((a, b) => b.date - a.date)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusStyles = (status) => {
    if (status === "Present") return { backgroundColor: "var(--color-success-bg)", color: "var(--color-success-text)" }
    if (status === "Late") return { backgroundColor: "var(--color-warning-bg)", color: "var(--color-warning-text)" }
    return { backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)" }
  }

  const styles = {
    container: { padding: "var(--spacing-6) var(--spacing-4)" },
    containerInner: { maxWidth: "var(--container-xl)", margin: "0 auto" },
    header: { marginBottom: "var(--spacing-6)" },
    title: { fontSize: "var(--font-size-3xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-2)" },
    subtitle: { fontSize: "var(--font-size-base)", color: "var(--color-text-muted)" },
    card: { backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-xl)", padding: "var(--spacing-6)", boxShadow: "var(--shadow-sm)", transition: "var(--transition-all)", border: "var(--border-1) solid var(--color-border-light)" },
    cardHeader: { display: "flex", alignItems: "center", marginBottom: "var(--spacing-4)" },
    cardIconWrapper: { padding: "var(--spacing-2-5)", marginRight: "var(--spacing-3)", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-info-bg)", color: "var(--color-primary)" },
    cardTitle: { fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)" },
    loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", padding: "var(--spacing-12)" },
    spinner: { width: "var(--icon-4xl)", height: "var(--icon-4xl)", border: "var(--border-4) solid var(--color-primary)", borderTop: "var(--border-4) solid transparent", borderRadius: "var(--radius-full)", animation: "spin 1s linear infinite" },
    tableContainer: { overflowX: "auto" },
    table: { minWidth: "100%", borderCollapse: "collapse" },
    thead: { backgroundColor: "var(--table-header-bg)" },
    th: { padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wider)" },
    tbody: { backgroundColor: "var(--color-bg-primary)" },
    td: { padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", borderBottom: "var(--border-1) solid var(--color-border-primary)" },
    statusBadge: { padding: "var(--spacing-0-5) var(--spacing-2)", display: "inline-flex", fontSize: "var(--font-size-xs)", lineHeight: "var(--line-height-snug)", fontWeight: "var(--font-weight-semibold)", borderRadius: "var(--radius-full)" },
    emptyState: { textAlign: "center", padding: "var(--spacing-8)" },
    emptyText: { color: "var(--color-text-muted)", fontSize: "var(--font-size-base)" },
  }

  return (
    <div style={styles.container}>
      <div style={styles.containerInner}>
        <div style={styles.header}>
          <h1 style={styles.title}>Maintenance Staff Attendance</h1>
          <p style={styles.subtitle}>Generate your QR code for attendance tracking and view your attendance history.</p>
        </div>

        <div className="grid-cols-attendance">
          <div><MaintenanceQRGenerator /></div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrapper}><FaHistory size={20} /></div>
              <h2 style={styles.cardTitle}>Attendance History</h2>
            </div>

            {loading ? (
              <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>
            ) : attendanceHistory.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead style={styles.thead}>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Check In</th>
                      <th style={styles.th}>Check Out</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody style={styles.tbody}>
                    {attendanceHistory.map((record, index) => (
                      <tr key={record._id || index}>
                        <td style={styles.td}>{formatDate(record.date).split(" ")[0]}</td>
                        <td style={styles.td}>{record.checkIn ? formatDate(record.checkIn).split(" ")[1] : "N/A"}</td>
                        <td style={styles.td}>{record.checkOut ? formatDate(record.checkOut).split(" ")[1] : "N/A"}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusBadge, ...getStatusStyles(record.status) }}>{record.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.emptyState}><p style={styles.emptyText}>No attendance records found.</p></div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .grid-cols-attendance { display: grid; grid-template-columns: 1fr; gap: var(--spacing-6); }
        @media (min-width: 1024px) { .grid-cols-attendance { grid-template-columns: 1fr 2fr; } }
      `}</style>
    </div>
  )
}

export default MaintenanceAttendance
