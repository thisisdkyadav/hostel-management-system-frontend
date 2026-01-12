import { useState } from "react"
import { Search, RefreshCw, Download, ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw, LogIn, LogOut, ArrowRightLeft, Home, ChevronLeft, ChevronRight, Activity } from "lucide-react"
import { useLiveCheckInOut } from "../../hooks/useLiveCheckInOut"
import { useGlobal } from "../../contexts/GlobalProvider"
import { Input, Select, Card, HStack, VStack, Button, Badge, Divider, DatePicker, Label } from "@/components/ui"

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

const StatCard = ({ icon: Icon, label, value, color, dotColor }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-3)",
      padding: "var(--spacing-3) var(--spacing-4)",
      backgroundColor: "var(--color-bg-primary)",
      borderRadius: "var(--radius-lg)",
      border: "var(--border-1) solid var(--color-border-primary)",
      minWidth: "120px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "var(--radius-md)",
        backgroundColor: color ? `${color}15` : "var(--color-bg-tertiary)",
      }}
    >
      {Icon ? (
        <Icon size={18} style={{ color: color || "var(--color-text-muted)" }} />
      ) : (
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "var(--radius-full)",
            backgroundColor: dotColor || "var(--color-primary)",
          }}
        />
      )}
    </div>
    <div>
      <p
        style={{
          fontSize: "var(--font-size-2xs)",
          fontWeight: "var(--font-weight-medium)",
          textTransform: "uppercase",
          letterSpacing: "var(--letter-spacing-wide)",
          color: "var(--color-text-muted)",
          marginBottom: "var(--spacing-0-5)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-text-primary)",
        }}
      >
        {value}
      </p>
    </div>
  </div>
)

const StatusBadge = ({ status }) => {
  const isCheckedIn = status === "Checked In"
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-1)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--spacing-0-5) var(--spacing-2)",
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-medium)",
        backgroundColor: isCheckedIn ? "var(--color-success-bg-light)" : "var(--color-danger-bg-light)",
        color: isCheckedIn ? "var(--color-success-text)" : "var(--color-danger-text)",
        border: `var(--border-1) solid ${isCheckedIn ? "var(--color-success-bg)" : "var(--color-danger-bg)"}`,
      }}
    >
      {isCheckedIn ? <LogIn size={12} /> : <LogOut size={12} />}
      {status}
    </span>
  )
}

const TrajectoryBadge = ({ isSameHostel }) => {
  const isSame = isSameHostel === true
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-1)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--spacing-0-5) var(--spacing-2)",
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-medium)",
        backgroundColor: isSame ? "var(--color-info-bg-light)" : "var(--color-purple-bg)",
        color: isSame ? "var(--color-info-text)" : "var(--color-purple-text)",
        border: `var(--border-1) solid ${isSame ? "var(--color-info-bg)" : "var(--color-purple-light-bg)"}`,
      }}
    >
      {isSame ? <Home size={12} /> : <ArrowRightLeft size={12} />}
      {isSame ? "Same" : "Cross"}
    </span>
  )
}

const LiveCheckInOutPage = () => {
  const { hostelList } = useGlobal()
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  const { entries, stats, hostelWiseStats, pagination, loading, error, socketStatus, lastRealtimeEntryId, filters, updateFilters, resetFilters, goToPage, nextPage, prevPage, refresh } = useLiveCheckInOut()

  const todayStats = stats?.today ?? DEFAULT_TODAY_STATS
  const totalStats = stats?.total ?? DEFAULT_TOTAL_STATS
  const totalRecords = pagination?.total ?? entries.length
  const currentPage = pagination?.page ?? 1
  const pageSize = pagination?.limit ?? 10
  const totalPages = pagination?.totalPages ?? 1

  const handleFilterChange = (key, value) => updateFilters({ [key]: value })
  const handleLimitChange = (value) => {
    const parsed = Number.parseInt(value, 10)
    handleFilterChange("limit", Number.isNaN(parsed) ? 10 : parsed)
  }

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.status) count++
    if (filters.hostelId) count++
    if (filters.isSameHostel) count++
    if (filters.startDate) count++
    if (filters.endDate) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

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
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-page)", padding: "var(--spacing-4)" }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* Header */}
        <HStack justify="between" align="center" style={{ marginBottom: "var(--spacing-4)" }}>
          <div>
            <HStack gap="small" align="center">
              <h1
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text-primary)",
                }}
              >
                Live Check-In/Out Monitor
              </h1>
              <Badge variant={socketStatus === "connected" ? "success" : "danger"} size="small">
                <HStack gap="xsmall" align="center">
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: socketStatus === "connected" ? "var(--color-success)" : "var(--color-danger)",
                    }}
                  />
                  {socketStatus === "connected" ? "Live" : "Offline"}
                </HStack>
              </Badge>
            </HStack>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>
              {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <HStack gap="small">
            <Button onClick={refresh} disabled={loading} variant="primary" size="small" isLoading={loading} icon={<RefreshCw size={16} />}>
              Refresh
            </Button>
            <Button onClick={exportToCSV} variant="secondary" size="small" icon={<Download size={16} />}>
              Export
            </Button>
          </HStack>
        </HStack>

        {/* Stats Row - All in one row */}
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-3)",
            marginBottom: "var(--spacing-4)",
            overflowX: "auto",
            paddingBottom: "var(--spacing-2)",
          }}
        >
          <StatCard dotColor="var(--color-success)" label="In Today" value={todayStats.checkedIn} />
          <StatCard dotColor="var(--color-danger)" label="Out Today" value={todayStats.checkedOut} />
          <StatCard dotColor="var(--color-purple-text)" label="Cross Hostel" value={todayStats.crossHostel} />
          <StatCard dotColor="var(--color-info)" label="Same Hostel" value={todayStats.sameHostel} />
          <StatCard icon={LogIn} label="Total In" value={totalStats.checkedIn} color="var(--color-success)" />
          <StatCard icon={LogOut} label="Total Out" value={totalStats.checkedOut} color="var(--color-danger)" />
          <StatCard icon={Activity} label="Loaded" value={loading ? "..." : entries.length} color="var(--color-primary)" />
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              marginBottom: "var(--spacing-4)",
              borderRadius: "var(--radius-lg)",
              border: "var(--border-1) solid var(--color-danger-border)",
              backgroundColor: "var(--color-danger-bg-light)",
              padding: "var(--spacing-3)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-danger-text)",
            }}
          >
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>Error:</span> {error}
          </div>
        )}

        {/* Filter Section - Like StudentFilterSection */}
        <Card style={{ marginBottom: "var(--spacing-4)", overflow: "visible" }} padding="p-4">
          <HStack gap="small" align="center">
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search student, room, reason..."
                icon={<Search size={16} />}
              />
            </div>
            <Button onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} variant="secondary" size="small" icon={<SlidersHorizontal size={16} />}>
              {isFiltersExpanded ? "Less" : "More"}
              {activeFilterCount > 0 && !isFiltersExpanded && (
                <Badge variant="primary" size="small" style={{ marginLeft: "var(--spacing-1-5)" }}>
                  {activeFilterCount}
                </Badge>
              )}
              {isFiltersExpanded ? <ChevronUp size={14} style={{ marginLeft: "var(--spacing-1)" }} /> : <ChevronDown size={14} style={{ marginLeft: "var(--spacing-1)" }} />}
            </Button>
            <Button onClick={resetFilters} variant="ghost" size="small" icon={<RotateCcw size={14} />}>
              Reset
            </Button>
          </HStack>

          {/* Expanded filters section */}
          {isFiltersExpanded && (
            <VStack gap="medium" style={{ marginTop: "var(--spacing-4)" }}>
              <Divider spacing="none" />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", rowGap: "var(--spacing-4)", columnGap: "var(--spacing-4)", paddingTop: "var(--spacing-4)" }}>
                <VStack gap="xsmall">
                  <Label size="sm">Status</Label>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    placeholder="All Status"
                    options={[
                      { value: "Checked In", label: "Checked In" },
                      { value: "Checked Out", label: "Checked Out" },
                    ]}
                  />
                </VStack>

                <VStack gap="xsmall">
                  <Label size="sm">Entry Type</Label>
                  <Select
                    value={filters.isSameHostel}
                    onChange={(e) => handleFilterChange("isSameHostel", e.target.value)}
                    placeholder="All Types"
                    options={[
                      { value: "true", label: "Same Hostel" },
                      { value: "false", label: "Cross-Hostel" },
                    ]}
                  />
                </VStack>

                <VStack gap="xsmall">
                  <Label size="sm">Hostel</Label>
                  <Select
                    value={filters.hostelId}
                    onChange={(e) => handleFilterChange("hostelId", e.target.value)}
                    placeholder="All Hostels"
                    options={hostelList?.map((hostel) => ({ value: hostel._id, label: hostel.name })) || []}
                  />
                </VStack>

                <VStack gap="xsmall">
                  <Label size="sm">Entries per page</Label>
                  <Select
                    value={filters.limit}
                    onChange={(e) => handleLimitChange(e.target.value)}
                    options={[
                      { value: "20", label: "20" },
                      { value: "50", label: "50" },
                      { value: "100", label: "100" },
                    ]}
                  />
                </VStack>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-4)" }}>
                <VStack gap="xsmall">
                  <Label size="sm">Start Date</Label>
                  <DatePicker
                    name="startDate"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    placeholder="Select start date"
                  />
                </VStack>

                <VStack gap="xsmall">
                  <Label size="sm">End Date</Label>
                  <DatePicker
                    name="endDate"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    placeholder="Select end date"
                    min={filters.startDate}
                  />
                </VStack>
              </div>
            </VStack>
          )}
        </Card>

        {/* Main Table */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {loading && entries.length === 0 ? (
            <div style={{ display: "flex", height: "256px", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  height: "32px",
                  width: "32px",
                  borderRadius: "var(--radius-full)",
                  border: "var(--border-3) solid var(--color-border-primary)",
                  borderTopColor: "var(--color-primary)",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          ) : entries.length === 0 ? (
            <div style={{ display: "flex", height: "256px", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--spacing-2)", color: "var(--color-text-muted)" }}>
              <Activity size={48} />
              <p style={{ fontSize: "var(--font-size-sm)" }}>No entries match filters</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "var(--font-size-sm)", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "var(--color-bg-tertiary)", borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
                    <tr>
                      {["#", "Time", "Student", "Status", "Hostel", "Room", "Type", "Reason"].map((header) => (
                        <th
                          key={header}
                          style={{
                            padding: "var(--spacing-3)",
                            textAlign: "left",
                            fontWeight: "var(--font-weight-semibold)",
                            fontSize: "var(--font-size-xs)",
                            color: "var(--color-text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "var(--letter-spacing-wide)",
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => {
                      const isFresh = entry._id === lastRealtimeEntryId
                      return (
                        <tr
                          key={entry._id}
                          style={{
                            backgroundColor: isFresh ? "var(--color-info-bg-light)" : "transparent",
                            transition: "var(--transition-colors)",
                            borderBottom: "var(--border-1) solid var(--color-border-light)",
                          }}
                        >
                          <td style={{ padding: "var(--spacing-3)", color: "var(--color-text-muted)" }}>{index + 1 + (currentPage - 1) * pageSize}</td>
                          <td style={{ padding: "var(--spacing-3)" }}>
                            <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{formatDateTime(entry.dateAndTime)}</div>
                            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-light)" }}>{getTimeAgo(entry.dateAndTime)}</div>
                          </td>
                          <td style={{ padding: "var(--spacing-3)" }}>
                            <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{entry.userId?.name || "Unknown"}</div>
                            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{entry.userId?.email || "-"}</div>
                          </td>
                          <td style={{ padding: "var(--spacing-3)" }}>
                            <StatusBadge status={entry.status} />
                          </td>
                          <td style={{ padding: "var(--spacing-3)" }}>
                            <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{entry.hostelName || "-"}</div>
                            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{entry.hostelId?.type || "-"}</div>
                          </td>
                          <td style={{ padding: "var(--spacing-3)", color: "var(--color-text-body)" }}>
                            R{entry.room || "?"}
                            {entry.unit ? " U" + entry.unit : ""}
                            {entry.bed ? " B" + entry.bed : ""}
                          </td>
                          <td style={{ padding: "var(--spacing-3)" }}>
                            <TrajectoryBadge isSameHostel={entry.isSameHostel} />
                          </td>
                          <td style={{ padding: "var(--spacing-3)" }}>
                            <p
                              style={{
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: "var(--color-text-muted)",
                              }}
                              title={entry.reason || "No reason"}
                            >
                              {entry.reason || "-"}
                            </p>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "var(--border-1) solid var(--color-border-primary)",
                    padding: "var(--spacing-3) var(--spacing-4)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <p style={{ color: "var(--color-text-muted)" }}>
                    {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-1)" }}>
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      style={{
                        display: "flex",
                        height: "var(--spacing-7)",
                        width: "var(--spacing-7)",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--radius-md)",
                        border: "var(--border-1) solid var(--color-border-dark)",
                        backgroundColor: "var(--color-bg-primary)",
                        color: "var(--color-text-muted)",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? "0.4" : "1",
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) pageNum = i + 1
                      else if (currentPage <= 3) pageNum = i + 1
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                      else pageNum = currentPage - 2 + i

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          style={{
                            display: "flex",
                            height: "var(--spacing-7)",
                            width: "var(--spacing-7)",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "var(--radius-md)",
                            border: currentPage === pageNum ? "var(--border-1) solid var(--color-primary)" : "var(--border-1) solid var(--color-border-dark)",
                            backgroundColor: currentPage === pageNum ? "var(--color-primary)" : "var(--color-bg-primary)",
                            color: currentPage === pageNum ? "var(--color-white)" : "var(--color-text-muted)",
                            cursor: "pointer",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      style={{
                        display: "flex",
                        height: "var(--spacing-7)",
                        width: "var(--spacing-7)",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--radius-md)",
                        border: "var(--border-1) solid var(--color-border-dark)",
                        backgroundColor: "var(--color-bg-primary)",
                        color: "var(--color-text-muted)",
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        opacity: currentPage === totalPages ? "0.4" : "1",
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Hostel-wise summary */}
        {hostelWiseStats.length > 0 && (
          <div style={{ marginTop: "var(--spacing-4)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-text-primary)",
                marginBottom: "var(--spacing-3)",
              }}
            >
              Hostel-wise Summary
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--spacing-3)" }}>
              {hostelWiseStats.map((hostel) => (
                <Card key={hostel.hostelId || hostel.hostelName} padding="p-4">
                  <HStack justify="between" align="start">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "var(--font-size-sm)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--color-text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={hostel.hostelName}
                      >
                        {hostel.hostelName}
                      </p>
                      <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{hostel.hostelType}</p>
                    </div>
                    <Badge variant="info" size="small">
                      {hostel.total}
                    </Badge>
                  </HStack>
                  <HStack gap="medium" style={{ marginTop: "var(--spacing-2)" }}>
                    <HStack gap="xsmall" align="center">
                      <div style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-success)" }} />
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{hostel.checkedIn}</span>
                    </HStack>
                    <HStack gap="xsmall" align="center">
                      <div style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-danger)" }} />
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{hostel.checkedOut}</span>
                    </HStack>
                    <HStack gap="xsmall" align="center">
                      <div style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-purple-text)" }} />
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{hostel.crossHostel}</span>
                    </HStack>
                  </HStack>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default LiveCheckInOutPage
