import { useState } from "react"
import { FiFilter, FiSearch, FiDownload, FiRefreshCw, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { MdLogin, MdLogout, MdSwapHoriz, MdHome } from "react-icons/md"
import { RiRadarLine } from "react-icons/ri"
import { useLiveCheckInOut } from "../../hooks/useLiveCheckInOut"
import { useGlobal } from "../../contexts/GlobalProvider"
import { Input, Select } from "@/components/ui"

const formatDateTime = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getTimeAgo = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  const diff = Date.now() - date.getTime()
  if (diff < 0) return "now"

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "now"
  if (minutes < 60) return minutes + "m"

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours + "h"

  const days = Math.floor(hours / 24)
  return days + "d"
}

const DEFAULT_TODAY_STATS = { checkedIn: 0, checkedOut: 0, sameHostel: 0, crossHostel: 0, total: 0 }
const DEFAULT_TOTAL_STATS = { checkedIn: 0, checkedOut: 0 }

// Styles object using CSS variables from theme.css
const styles = {
  // Main container
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "var(--color-bg-page)",
    padding: "var(--spacing-4)",
  },
  maxWidthContainer: {
    maxWidth: "1600px",
    margin: "0 auto",
  },

  // Header
  header: {
    backgroundColor: "var(--color-bg-primary)",
    boxShadow: "var(--shadow-sm)",
    borderBottom: "var(--border-1) solid var(--color-border-light)",
    margin: "calc(-1 * var(--spacing-4))",
    marginBottom: "var(--spacing-3)",
    padding: "var(--spacing-2-5) var(--spacing-4)",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-3)",
  },
  pageTitle: {
    fontSize: "var(--font-size-2xl)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-primary)",
    letterSpacing: "var(--letter-spacing-tight)",
  },
  dateSubtitle: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-muted)",
    marginTop: "var(--spacing-0-5)",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-2)",
  },

  // Status badge
  statusBadge: (isConnected) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-1-5)",
    borderRadius: "var(--radius-md)",
    padding: "var(--spacing-0-5) var(--spacing-2)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    backgroundColor: isConnected ? "var(--color-success-bg)" : "var(--color-danger-bg)",
    color: isConnected ? "var(--color-success-text)" : "var(--color-danger-text)",
  }),
  statusDot: (isConnected) => ({
    height: "var(--spacing-1-5)",
    width: "var(--spacing-1-5)",
    borderRadius: "var(--radius-full)",
    backgroundColor: isConnected ? "var(--color-success)" : "var(--color-danger)",
  }),
  lastUpdateText: {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-light)",
  },

  // Buttons
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-1-5)",
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--color-primary)",
    padding: "var(--spacing-1-5) var(--spacing-3)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-white)",
    transition: "var(--transition-colors)",
    border: "none",
    cursor: "pointer",
  },
  primaryButtonHover: {
    backgroundColor: "var(--color-primary-hover)",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-1-5)",
    borderRadius: "var(--radius-full)",
    border: "var(--border-1) solid var(--color-border-dark)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-1-5) var(--spacing-3)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-body)",
    transition: "var(--transition-colors)",
    cursor: "pointer",
  },

  // Stats grid
  statsGrid: {
    marginBottom: "var(--spacing-3)",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "var(--spacing-2)",
  },
  statCard: {
    borderRadius: "var(--radius-md)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-2-5) var(--spacing-1-5)",
  },
  statHeader: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-1-5)",
  },
  statDot: (color) => ({
    height: "var(--spacing-1-5)",
    width: "var(--spacing-1-5)",
    borderRadius: "var(--radius-full)",
    backgroundColor: color,
  }),
  statLabel: {
    fontSize: "var(--font-size-2xs)",
    fontWeight: "var(--font-weight-medium)",
    textTransform: "uppercase",
    letterSpacing: "var(--letter-spacing-wide)",
    color: "var(--color-text-muted)",
  },
  statValue: {
    marginTop: "var(--spacing-0-5)",
    fontSize: "var(--font-size-xl)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-primary)",
  },
  statIcon: {
    height: "var(--icon-xs)",
    width: "var(--icon-xs)",
    color: "var(--color-text-light)",
  },

  // Error banner
  errorBanner: {
    marginBottom: "var(--spacing-3)",
    borderRadius: "var(--radius-md)",
    border: "var(--border-1) solid var(--color-danger-border)",
    backgroundColor: "var(--color-danger-bg)",
    padding: "var(--spacing-3) var(--spacing-2)",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-danger-text)",
  },

  // Filters
  filtersContainer: {
    marginBottom: "var(--spacing-3)",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "var(--spacing-2)",
    borderRadius: "var(--radius-md)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-2) var(--spacing-3)",
  },
  searchContainer: {
    position: "relative",
    minWidth: "200px",
    flex: "1",
  },
  searchIcon: {
    pointerEvents: "none",
    position: "absolute",
    left: "var(--spacing-2)",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-light)",
  },
  searchInput: {
    width: "100%",
    borderRadius: "var(--radius-sm)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-1) var(--spacing-2) var(--spacing-1) var(--spacing-7)",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-primary)",
    outline: "none",
  },
  selectInput: {
    borderRadius: "var(--radius-sm)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-1) var(--spacing-2)",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-primary)",
    outline: "none",
  },
  dateInput: {
    borderRadius: "var(--radius-sm)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-1) var(--spacing-2)",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-primary)",
    outline: "none",
  },
  clearButton: {
    borderRadius: "var(--radius-sm)",
    backgroundColor: "var(--color-danger-bg)",
    padding: "var(--spacing-1) var(--spacing-2)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-danger-text)",
    border: "none",
    cursor: "pointer",
  },

  // Table container
  tableContainer: {
    borderRadius: "var(--radius-md)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
    boxShadow: "var(--shadow-sm)",
  },
  loadingContainer: {
    display: "flex",
    height: "256px",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    height: "var(--icon-2xl)",
    width: "var(--icon-2xl)",
    borderRadius: "var(--radius-full)",
    border: "var(--border-2) solid var(--color-border-primary)",
    borderTopColor: "var(--color-primary)",
    animation: "spin 1s linear infinite",
  },
  emptyContainer: {
    display: "flex",
    height: "256px",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-2)",
    color: "var(--color-text-light)",
  },
  emptyIcon: {
    fontSize: "var(--font-size-3xl)",
  },
  emptyText: {
    fontSize: "var(--font-size-xs)",
  },

  // Table
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    minWidth: "100%",
    fontSize: "var(--font-size-xs)",
  },
  tableHeader: {
    borderBottom: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-tertiary)",
  },
  tableHeaderCell: {
    padding: "var(--spacing-2)",
    textAlign: "left",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-muted)",
  },
  tableBody: {
    // Divider handled via border
  },
  tableRow: (isFresh) => ({
    fontSize: "var(--font-size-xs)",
    backgroundColor: isFresh ? "var(--color-info-bg-light)" : "transparent",
    transition: "var(--transition-colors)",
  }),
  tableCell: {
    padding: "var(--spacing-1-5) var(--spacing-2)",
  },
  tableCellMuted: {
    padding: "var(--spacing-1-5) var(--spacing-2)",
    color: "var(--color-text-muted)",
  },
  nameText: {
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-primary)",
  },
  emailText: {
    fontSize: "var(--font-size-2xs)",
    color: "var(--color-text-muted)",
  },
  timeAgoText: {
    fontSize: "var(--font-size-2xs)",
    color: "var(--color-text-light)",
  },
  hostelTypeText: {
    fontSize: "var(--font-size-2xs)",
    color: "var(--color-text-muted)",
  },
  roomText: {
    color: "var(--color-text-body)",
  },
  reasonText: {
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--color-text-muted)",
  },

  // Status badges in table
  statusBadgeCheckedIn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-1)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--spacing-0-5) var(--spacing-1-5)",
    fontSize: "var(--font-size-2xs)",
    fontWeight: "var(--font-weight-semibold)",
    border: "var(--border-1) solid var(--color-success-bg)",
    backgroundColor: "var(--color-success-bg-light)",
    color: "var(--color-success-text)",
  },
  statusBadgeCheckedOut: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-1)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--spacing-0-5) var(--spacing-1-5)",
    fontSize: "var(--font-size-2xs)",
    fontWeight: "var(--font-weight-semibold)",
    border: "var(--border-1) solid var(--color-danger-bg)",
    backgroundColor: "var(--color-danger-bg-light)",
    color: "var(--color-danger-text)",
  },
  statusBadgeDefault: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-1)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--spacing-0-5) var(--spacing-1-5)",
    fontSize: "var(--font-size-2xs)",
    fontWeight: "var(--font-weight-semibold)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-tertiary)",
    color: "var(--color-text-muted)",
  },

  // Trajectory badges
  trajectoryBadgeSame: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-0-5)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--spacing-0-5) var(--spacing-1-5)",
    fontSize: "var(--font-size-2xs)",
    fontWeight: "var(--font-weight-medium)",
    border: "var(--border-1) solid var(--color-info-bg)",
    backgroundColor: "var(--color-info-bg-light)",
    color: "var(--color-info-text)",
  },
  trajectoryBadgeCross: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-0-5)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--spacing-0-5) var(--spacing-1-5)",
    fontSize: "var(--font-size-2xs)",
    fontWeight: "var(--font-weight-medium)",
    border: "var(--border-1) solid var(--color-purple-light-bg)",
    backgroundColor: "var(--color-purple-bg)",
    color: "var(--color-purple-text)",
  },
  trajectoryBadgeDefault: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-0-5)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--spacing-0-5) var(--spacing-1-5)",
    fontSize: "var(--font-size-2xs)",
    fontWeight: "var(--font-weight-medium)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-tertiary)",
    color: "var(--color-text-muted)",
  },

  // Pagination
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "var(--border-1) solid var(--color-border-primary)",
    padding: "var(--spacing-2) var(--spacing-3)",
    fontSize: "var(--font-size-xs)",
  },
  paginationText: {
    color: "var(--color-text-muted)",
  },
  paginationButtons: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-1)",
  },
  paginationButton: {
    display: "flex",
    height: "var(--spacing-6)",
    width: "var(--spacing-6)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    border: "var(--border-1) solid var(--color-border-dark)",
    backgroundColor: "var(--color-bg-primary)",
    color: "var(--color-text-muted)",
    cursor: "pointer",
  },
  paginationButtonActive: {
    display: "flex",
    height: "var(--spacing-6)",
    width: "var(--spacing-6)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    border: "var(--border-1) solid var(--color-primary)",
    backgroundColor: "var(--color-primary)",
    color: "var(--color-white)",
    cursor: "pointer",
  },

  // Hostel-wise summary
  hostelSummaryGrid: {
    marginTop: "var(--spacing-3)",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "var(--spacing-2)",
  },
  hostelCard: {
    borderRadius: "var(--radius-md)",
    border: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-2-5) var(--spacing-1-5)",
  },
  hostelCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hostelCardInfo: {
    minWidth: "0",
    flex: "1",
  },
  hostelName: {
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  hostelType: {
    fontSize: "var(--font-size-2xs)",
    color: "var(--color-text-muted)",
  },
  hostelTotalBadge: {
    marginLeft: "var(--spacing-2)",
    borderRadius: "var(--radius-sm)",
    backgroundColor: "var(--color-info-bg)",
    padding: "var(--spacing-0-5) var(--spacing-1-5)",
    fontSize: "var(--font-size-2xs)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-primary)",
  },
  hostelStats: {
    marginTop: "var(--spacing-1-5)",
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-2)",
    fontSize: "var(--font-size-2xs)",
    color: "var(--color-text-muted)",
  },
  hostelStatItem: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-0-5)",
  },
  hostelStatDot: (color) => ({
    height: "var(--spacing-1)",
    width: "var(--spacing-1)",
    borderRadius: "var(--radius-full)",
    backgroundColor: color,
  }),

  // Filter Sidebar
  sidebarOverlay: {
    position: "fixed",
    inset: "0",
    zIndex: "var(--z-modal)",
    display: "flex",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  sidebar: {
    height: "100%",
    width: "100%",
    maxWidth: "var(--modal-width-sm)",
    borderLeft: "var(--border-1) solid var(--color-border-primary)",
    backgroundColor: "var(--color-bg-primary)",
    boxShadow: "var(--shadow-xl)",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "var(--border-1) solid var(--color-border-primary)",
    padding: "var(--spacing-3) var(--spacing-4)",
  },
  sidebarTitle: {
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-primary)",
  },
  sidebarCloseButton: {
    display: "flex",
    height: "var(--spacing-7)",
    width: "var(--spacing-7)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  sidebarCloseIcon: {
    fontSize: "var(--font-size-lg)",
    color: "var(--color-text-muted)",
  },
  sidebarContent: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
    padding: "var(--spacing-4)",
    fontSize: "var(--font-size-xs)",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  formLabel: {
    marginBottom: "var(--spacing-1)",
    display: "block",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-body)",
  },
  formInputFull: {
    width: "100%",
    borderRadius: "var(--radius-sm)",
    border: "var(--border-1) solid var(--color-border-dark)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-1-5) var(--spacing-2)",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-primary)",
    outline: "none",
  },
  formInputWithIcon: {
    width: "100%",
    borderRadius: "var(--radius-sm)",
    border: "var(--border-1) solid var(--color-border-dark)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-1-5) var(--spacing-2) var(--spacing-1-5) var(--spacing-7)",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-primary)",
    outline: "none",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "var(--spacing-3)",
  },
  sidebarActions: {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-2)",
    paddingTop: "var(--spacing-2)",
  },
  resetButton: {
    flex: "1",
    borderRadius: "var(--radius-sm)",
    border: "var(--border-1) solid var(--color-border-dark)",
    backgroundColor: "var(--color-bg-primary)",
    padding: "var(--spacing-1-5) var(--spacing-3)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-body)",
    cursor: "pointer",
  },
  applyButton: {
    flex: "1",
    borderRadius: "var(--radius-sm)",
    backgroundColor: "var(--color-primary)",
    padding: "var(--spacing-1-5) var(--spacing-3)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-white)",
    border: "none",
    cursor: "pointer",
  },
  iconXs: {
    height: "var(--icon-xs)",
    width: "var(--icon-xs)",
  },
}

// Helper functions for status/trajectory badge styles
const getStatusBadgeStyle = (status) => {
  if (status === "Checked In") return styles.statusBadgeCheckedIn
  if (status === "Checked Out") return styles.statusBadgeCheckedOut
  return styles.statusBadgeDefault
}

const getTrajectoryBadgeStyle = (isSameHostel) => {
  if (isSameHostel === true) return styles.trajectoryBadgeSame
  if (isSameHostel === false) return styles.trajectoryBadgeCross
  return styles.trajectoryBadgeDefault
}

const getStatusIcon = (status) => {
  if (status === "Checked In") return <MdLogin style={styles.iconXs} />
  if (status === "Checked Out") return <MdLogout style={styles.iconXs} />
  return <MdSwapHoriz style={styles.iconXs} />
}

const getTrajectoryIcon = (isSameHostel) => {
  if (isSameHostel === true) return <MdHome style={styles.iconXs} />
  return <MdSwapHoriz style={styles.iconXs} />
}

const LiveCheckInOutPage = () => {
  const { hostelList } = useGlobal()
  const [showFilters, setShowFilters] = useState(false)

  const { entries, stats, hostelWiseStats, pagination, loading, error, socketStatus, lastRealtimeEntryId, filters, updateFilters, resetFilters, goToPage, nextPage, prevPage, refresh } = useLiveCheckInOut()

  const todayStats = stats?.today ?? DEFAULT_TODAY_STATS
  const totalStats = stats?.total ?? DEFAULT_TOTAL_STATS
  const totalRecords = pagination?.total ?? entries.length
  const currentPage = pagination?.page ?? 1
  const pageSize = pagination?.limit ?? 10
  const totalPages = pagination?.totalPages ?? 1

  const highlightEntry = entries[0]

  const handleFilterChange = (key, value) => updateFilters({ [key]: value })
  const handleLimitChange = (value) => {
    const parsed = Number.parseInt(value, 10)
    handleFilterChange("limit", Number.isNaN(parsed) ? 10 : parsed)
  }

  const exportToCSV = () => {
    if (!entries.length) return
    try {
      const headers = ["#", "Time", "Student", "Email", "Status", "Hostel", "Room", "Type", "Reason"]
      const rows = entries.map((e, i) => [
        i + 1 + (currentPage - 1) * pageSize,
        formatDateTime(e.dateAndTime),
        e.userId?.name || "Unknown",
        e.userId?.email || "-",
        e.status,
        e.hostelName || "-",
        "R" + (e.room || "?") + (e.unit ? " U" + e.unit : "") + (e.bed ? " B" + e.bed : ""),
        e.isSameHostel ? "Same" : "Cross",
        e.reason || "-",
      ])

      const csv = [headers, ...rows].map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "live-checkin-out-" + new Date().toISOString().split("T")[0] + ".csv"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
    }
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.maxWidthContainer}>
        {/* Compact Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <div>
                <h1 style={styles.pageTitle}>Live Check-In/Out Monitor</h1>
                <p style={styles.dateSubtitle}>{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              <span style={styles.statusBadge(socketStatus === "connected")}>
                <span style={styles.statusDot(socketStatus === "connected")} />
                {socketStatus === "connected" ? "Live" : "Offline"}
              </span>
              {highlightEntry && <span style={styles.lastUpdateText}>Last: {getTimeAgo(highlightEntry.dateAndTime)}</span>}
            </div>

            <div style={styles.headerRight}>
              <button onClick={() => refresh()} disabled={loading} style={{ ...styles.primaryButton, opacity: loading ? "var(--opacity-disabled)" : "var(--opacity-100)" }}>
                <FiRefreshCw style={{ fontSize: "var(--font-size-xs)", animation: loading ? "spin 1s linear infinite" : "none" }} />
                Refresh
              </button>
              <button onClick={exportToCSV} style={styles.secondaryButton}>
                <FiDownload style={{ fontSize: "var(--font-size-xs)" }} />
                Export
              </button>
              <button onClick={() => setShowFilters(true)} style={styles.secondaryButton}>
                <FiFilter style={{ fontSize: "var(--font-size-xs)" }} />
                Filters
              </button>
            </div>
          </div>
        </header>

        {/* Compact Stats Row */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statDot("var(--color-success)")} />
              <span style={styles.statLabel}>In Today</span>
            </div>
            <p style={styles.statValue}>{todayStats.checkedIn}</p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statDot("var(--color-danger)")} />
              <span style={styles.statLabel}>Out Today</span>
            </div>
            <p style={styles.statValue}>{todayStats.checkedOut}</p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statDot("var(--color-purple-text)")} />
              <span style={styles.statLabel}>Cross Hostel</span>
            </div>
            <p style={styles.statValue}>{todayStats.crossHostel}</p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statDot("var(--color-info)")} />
              <span style={styles.statLabel}>Same Hostel</span>
            </div>
            <p style={styles.statValue}>{todayStats.sameHostel}</p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <MdLogin style={styles.statIcon} />
              <span style={styles.statLabel}>Total In</span>
            </div>
            <p style={styles.statValue}>{totalStats.checkedIn}</p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <MdLogout style={styles.statIcon} />
              <span style={styles.statLabel}>Total Out</span>
            </div>
            <p style={styles.statValue}>{totalStats.checkedOut}</p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <RiRadarLine style={styles.statIcon} />
              <span style={styles.statLabel}>Loaded</span>
            </div>
            <p style={styles.statValue}>{loading ? "..." : entries.length}</p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={{ ...styles.statIcon, fontSize: "var(--font-size-2xs)", fontWeight: "var(--font-weight-bold)" }}>#</span>
              <span style={styles.statLabel}>Total</span>
            </div>
            <p style={styles.statValue}>{totalRecords}</p>
          </div>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>Error:</span> {error}
          </div>
        )}

        {/* Compact Inline Filters */}
        <div style={styles.filtersContainer}>
          <div style={{ flex: 1 }}>
            <Input type="text" value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search student, room, reason..."
              icon={<FiSearch />}
            />
          </div>

          <Select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} options={[
            { value: "", label: "All Status" },
            { value: "Checked In", label: "Checked In" },
            { value: "Checked Out", label: "Checked Out" }
          ]} />

          <Select value={filters.isSameHostel} onChange={(e) => handleFilterChange("isSameHostel", e.target.value)} options={[
            { value: "", label: "All Types" },
            { value: "true", label: "Same Hostel" },
            { value: "false", label: "Cross-Hostel" }
          ]} />

          <Select value={filters.hostelId} onChange={(e) => handleFilterChange("hostelId", e.target.value)} options={[
            { value: "", label: "All Hostels" },
            ...hostelList?.map((hostel) => ({ value: hostel._id, label: hostel.name })) || []
          ]} />

          <Input type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />

          <Input type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />

          <Select value={filters.limit} onChange={(e) => handleLimitChange(e.target.value)} options={[
            { value: "20", label: "20/page" },
            { value: "50", label: "50/page" },
            { value: "100", label: "100/page" }
          ]} />

          {(filters.search || filters.status || filters.hostelId || filters.isSameHostel || filters.startDate || filters.endDate) && (
            <button onClick={resetFilters} style={styles.clearButton}>
              Clear
            </button>
          )}
        </div>

        {/* Compact Main Table */}
        <div style={styles.tableContainer}>
          {loading && entries.length === 0 ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
            </div>
          ) : entries.length === 0 ? (
            <div style={styles.emptyContainer}>
              <RiRadarLine style={styles.emptyIcon} />
              <p style={styles.emptyText}>No entries match filters</p>
            </div>
          ) : (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>#</th>
                      <th style={styles.tableHeaderCell}>Time</th>
                      <th style={styles.tableHeaderCell}>Student</th>
                      <th style={styles.tableHeaderCell}>Status</th>
                      <th style={styles.tableHeaderCell}>Hostel</th>
                      <th style={styles.tableHeaderCell}>Room</th>
                      <th style={styles.tableHeaderCell}>Type</th>
                      <th style={styles.tableHeaderCell}>Reason</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: "var(--border-1) solid var(--color-border-light)" }}>
                    {entries.map((entry, index) => {
                      const isFresh = entry._id === lastRealtimeEntryId

                      return (
                        <tr key={entry._id} style={styles.tableRow(isFresh)}>
                          <td style={styles.tableCellMuted}>{index + 1 + (currentPage - 1) * pageSize}</td>
                          <td style={styles.tableCell}>
                            <div style={styles.nameText}>{formatDateTime(entry.dateAndTime)}</div>
                            <div style={styles.timeAgoText}>{getTimeAgo(entry.dateAndTime)}</div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.nameText}>{entry.userId?.name || "Unknown"}</div>
                            <div style={styles.emailText}>{entry.userId?.email || "-"}</div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={getStatusBadgeStyle(entry.status)}>
                              {getStatusIcon(entry.status)}
                              {entry.status}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.nameText}>{entry.hostelName || "-"}</div>
                            <div style={styles.hostelTypeText}>{entry.hostelId?.type || "-"}</div>
                          </td>
                          <td style={{ ...styles.tableCell, ...styles.roomText }}>
                            R{entry.room || "?"}
                            {entry.unit ? " U" + entry.unit : ""}
                            {entry.bed ? " B" + entry.bed : ""}
                          </td>
                          <td style={styles.tableCell}>
                            <span style={getTrajectoryBadgeStyle(entry.isSameHostel)}>
                              {getTrajectoryIcon(entry.isSameHostel)}
                              {entry.isSameHostel ? "Same" : "Cross"}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <p style={styles.reasonText} title={entry.reason || "No reason"}>
                              {entry.reason || "-"}
                            </p>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Compact Pagination */}
              {totalPages > 1 && (
                <div style={styles.paginationContainer}>
                  <p style={styles.paginationText}>
                    {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
                  </p>
                  <div style={styles.paginationButtons}>
                    <button onClick={prevPage} disabled={currentPage === 1} style={{ ...styles.paginationButton, opacity: currentPage === 1 ? "var(--opacity-40)" : "var(--opacity-100)" }}>
                      <FiChevronLeft style={{ fontSize: "var(--font-size-xs)" }} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) pageNum = i + 1
                      else if (currentPage <= 3) pageNum = i + 1
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                      else pageNum = currentPage - 2 + i

                      return (
                        <button key={pageNum} onClick={() => goToPage(pageNum)} style={currentPage === pageNum ? styles.paginationButtonActive : styles.paginationButton}>
                          {pageNum}
                        </button>
                      )
                    })}
                    <button onClick={nextPage} disabled={currentPage === totalPages} style={{ ...styles.paginationButton, opacity: currentPage === totalPages ? "var(--opacity-40)" : "var(--opacity-100)" }}>
                      <FiChevronRight style={{ fontSize: "var(--font-size-xs)" }} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Hostel-wise summary - Compact */}
        {hostelWiseStats.length > 0 && (
          <div style={styles.hostelSummaryGrid}>
            {hostelWiseStats.map((hostel) => (
              <div key={hostel.hostelId || hostel.hostelName} style={styles.hostelCard}>
                <div style={styles.hostelCardHeader}>
                  <div style={styles.hostelCardInfo}>
                    <p style={styles.hostelName} title={hostel.hostelName}>
                      {hostel.hostelName}
                    </p>
                    <p style={styles.hostelType}>{hostel.hostelType}</p>
                  </div>
                  <span style={styles.hostelTotalBadge}>{hostel.total}</span>
                </div>
                <div style={styles.hostelStats}>
                  <span style={styles.hostelStatItem}>
                    <span style={styles.hostelStatDot("var(--color-success)")} />
                    {hostel.checkedIn}
                  </span>
                  <span style={styles.hostelStatItem}>
                    <span style={styles.hostelStatDot("var(--color-danger)")} />
                    {hostel.checkedOut}
                  </span>
                  <span style={styles.hostelStatItem}>
                    <span style={styles.hostelStatDot("var(--color-purple-text)")} />
                    {hostel.crossHostel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compact Filter Sidebar */}
      {showFilters && (
        <div style={styles.sidebarOverlay}>
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={styles.sidebarTitle}>Advanced Filters</h3>
              <button onClick={() => setShowFilters(false)} style={styles.sidebarCloseButton}>
                <FiX style={styles.sidebarCloseIcon} />
              </button>
            </div>

            <div style={styles.sidebarContent}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Search</label>
                <Input type="text" value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Student, room, reason..."
                  icon={<FiSearch />}
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Status</label>
                  <Select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} options={[
                    { value: "", label: "All" },
                    { value: "Checked In", label: "Checked In" },
                    { value: "Checked Out", label: "Checked Out" }
                  ]} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Type</label>
                  <Select value={filters.isSameHostel} onChange={(e) => handleFilterChange("isSameHostel", e.target.value)} options={[
                    { value: "", label: "All" },
                    { value: "true", label: "Same Hostel" },
                    { value: "false", label: "Cross-Hostel" }
                  ]} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Hostel</label>
                <Select value={filters.hostelId} onChange={(e) => handleFilterChange("hostelId", e.target.value)} options={[
                  { value: "", label: "All Hostels" },
                  ...hostelList?.map((hostel) => ({ value: hostel._id, label: hostel.name })) || []
                ]} />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Start Date</label>
                  <Input type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>End Date</label>
                  <Input type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Page Size</label>
                <Select value={filters.limit} onChange={(e) => handleLimitChange(e.target.value)} options={[
                  { value: "20", label: "20 per page" },
                  { value: "50", label: "50 per page" },
                  { value: "100", label: "100 per page" }
                ]} />
              </div>

              <div style={styles.sidebarActions}>
                <button onClick={resetFilters} style={styles.resetButton}>
                  Reset All
                </button>
                <button onClick={() => {
                  refresh()
                  setShowFilters(false)
                }}
                  style={styles.applyButton}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveCheckInOutPage

