import { useState } from "react"
import { FiFilter, FiSearch, FiDownload, FiRefreshCw, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { MdLogin, MdLogout, MdSwapHoriz, MdHome } from "react-icons/md"
import { RiRadarLine } from "react-icons/ri"
import { useLiveCheckInOut } from "../../hooks/useLiveCheckInOut"
import { useGlobal } from "../../contexts/GlobalProvider"

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

const getStatusTone = (status) => {
  if (status === "Checked In") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "Checked Out") return "border-rose-200 bg-rose-50 text-rose-700"
  return "border-gray-200 bg-gray-50 text-gray-600"
}

const getTrajectoryTone = (isSameHostel) => {
  if (isSameHostel === true) return "border-cyan-200 bg-cyan-50 text-cyan-700"
  if (isSameHostel === false) return "border-purple-200 bg-purple-50 text-purple-700"
  return "border-gray-200 bg-gray-50 text-gray-600"
}

const getStatusIcon = (status) => {
  if (status === "Checked In") return <MdLogin className="h-3 w-3" />
  if (status === "Checked Out") return <MdLogout className="h-3 w-3" />
  return <MdSwapHoriz className="h-3 w-3" />
}

const getTrajectoryIcon = (isSameHostel) => {
  if (isSameHostel === true) return <MdHome className="h-3 w-3" />
  return <MdSwapHoriz className="h-3 w-3" />
}

const DEFAULT_TODAY_STATS = { checkedIn: 0, checkedOut: 0, sameHostel: 0, crossHostel: 0, total: 0 }
const DEFAULT_TOTAL_STATS = { checkedIn: 0, checkedOut: 0 }

const LiveCheckInOut = () => {
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-[1600px]">
        {/* Compact Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 -mx-4 -mt-4 mb-3 px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-semibold text-[#1360aa] tracking-tight">Live Check-In/Out Monitor</h1>
                <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              <span className={["inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium", socketStatus === "connected" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"].join(" ")}>
                <span className={["h-1.5 w-1.5 rounded-full", socketStatus === "connected" ? "bg-emerald-500" : "bg-rose-500"].join(" ")} />
                {socketStatus === "connected" ? "Live" : "Offline"}
              </span>
              {highlightEntry && <span className="text-xs text-gray-400">Last: {getTimeAgo(highlightEntry.dateAndTime)}</span>}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => refresh()} disabled={loading} className="inline-flex items-center gap-1.5 rounded-full bg-[#1360aa] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0e4eb5] disabled:opacity-60">
                <FiRefreshCw className={["text-xs", loading ? "animate-spin" : ""].filter(Boolean).join(" ")} />
                Refresh
              </button>
              <button onClick={exportToCSV} className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
                <FiDownload className="text-xs" />
                Export
              </button>
              <button onClick={() => setShowFilters(true)} className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
                <FiFilter className="text-xs" />
                Filters
              </button>
            </div>
          </div>
        </header>

        {/* Compact Stats Row */}
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">In Today</span>
            </div>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">{todayStats.checkedIn}</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Out Today</span>
            </div>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">{todayStats.checkedOut}</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Cross Hostel</span>
            </div>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">{todayStats.crossHostel}</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Same Hostel</span>
            </div>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">{todayStats.sameHostel}</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <MdLogin className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Total In</span>
            </div>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">{totalStats.checkedIn}</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <MdLogout className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Total Out</span>
            </div>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">{totalStats.checkedOut}</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <RiRadarLine className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Loaded</span>
            </div>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">{loading ? "..." : entries.length}</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 text-[10px] font-bold text-gray-400">#</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Total</span>
            </div>
            <p className="mt-0.5 text-lg font-semibold text-gray-900">{totalRecords}</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Compact Inline Filters */}
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
          <div className="relative min-w-[200px] flex-1">
            <FiSearch className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search student, room, reason..."
              className="w-full rounded border border-gray-200 bg-white py-1 pl-7 pr-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#1360AB] focus:outline-none focus:ring-1 focus:ring-[#1360AB]"
            />
          </div>

          <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[#1360AB] focus:outline-none">
            <option value="">All Status</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
          </select>

          <select value={filters.isSameHostel} onChange={(e) => handleFilterChange("isSameHostel", e.target.value)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[#1360AB] focus:outline-none">
            <option value="">All Types</option>
            <option value="true">Same Hostel</option>
            <option value="false">Cross-Hostel</option>
          </select>

          <select value={filters.hostelId} onChange={(e) => handleFilterChange("hostelId", e.target.value)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[#1360AB] focus:outline-none">
            <option value="">All Hostels</option>
            {hostelList?.map((hostel) => (
              <option key={hostel._id} value={hostel._id}>
                {hostel.name}
              </option>
            ))}
          </select>

          <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[#1360AB] focus:outline-none" />

          <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[#1360AB] focus:outline-none" />

          <select value={filters.limit} onChange={(e) => handleLimitChange(e.target.value)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[#1360AB] focus:outline-none">
            <option value="20">20/page</option>
            <option value="50">50/page</option>
            <option value="100">100/page</option>
          </select>

          {(filters.search || filters.status || filters.hostelId || filters.isSameHostel || filters.startDate || filters.endDate) && (
            <button onClick={resetFilters} className="rounded bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100">
              Clear
            </button>
          )}
        </div>

        {/* Compact Main Table */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          {loading && entries.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#1360AB]" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-400">
              <RiRadarLine className="text-2xl" />
              <p className="text-xs">No entries match filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">#</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Time</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Student</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Status</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Hostel</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Room</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Type</th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-600">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {entries.map((entry, index) => {
                      const isFresh = entry._id === lastRealtimeEntryId
                      const rowClass = ["text-xs hover:bg-blue-50/50 transition-colors", isFresh ? "bg-blue-50" : ""].filter(Boolean).join(" ")

                      return (
                        <tr key={entry._id} className={rowClass}>
                          <td className="px-2 py-1.5 text-gray-500">{index + 1 + (currentPage - 1) * pageSize}</td>
                          <td className="px-2 py-1.5">
                            <div className="font-medium text-gray-900">{formatDateTime(entry.dateAndTime)}</div>
                            <div className="text-[10px] text-gray-400">{getTimeAgo(entry.dateAndTime)}</div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="font-medium text-gray-900">{entry.userId?.name || "Unknown"}</div>
                            <div className="text-[10px] text-gray-500">{entry.userId?.email || "-"}</div>
                          </td>
                          <td className="px-2 py-1.5">
                            <span className={["inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold", getStatusTone(entry.status)].join(" ")}>
                              {getStatusIcon(entry.status)}
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="text-gray-900">{entry.hostelName || "-"}</div>
                            <div className="text-[10px] text-gray-500">{entry.hostelId?.type || "-"}</div>
                          </td>
                          <td className="px-2 py-1.5 text-gray-700">
                            R{entry.room || "?"}
                            {entry.unit ? " U" + entry.unit : ""}
                            {entry.bed ? " B" + entry.bed : ""}
                          </td>
                          <td className="px-2 py-1.5">
                            <span className={["inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium", getTrajectoryTone(entry.isSameHostel)].join(" ")}>
                              {getTrajectoryIcon(entry.isSameHostel)}
                              {entry.isSameHostel ? "Same" : "Cross"}
                            </span>
                          </td>
                          <td className="px-2 py-1.5">
                            <p className="max-w-xs truncate text-gray-600" title={entry.reason || "No reason"}>
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
                <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2 text-xs">
                  <p className="text-gray-600">
                    {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={prevPage} disabled={currentPage === 1} className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                      <FiChevronLeft className="text-xs" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) pageNum = i + 1
                      else if (currentPage <= 3) pageNum = i + 1
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                      else pageNum = currentPage - 2 + i

                      return (
                        <button key={pageNum} onClick={() => goToPage(pageNum)} className={["flex h-6 w-6 items-center justify-center rounded border text-xs", currentPage === pageNum ? "border-[#1360AB] bg-[#1360AB] text-white" : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"].join(" ")}>
                          {pageNum}
                        </button>
                      )
                    })}
                    <button onClick={nextPage} disabled={currentPage === totalPages} className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                      <FiChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Hostel-wise summary - Compact */}
        {hostelWiseStats.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {hostelWiseStats.map((hostel) => (
              <div key={hostel.hostelId || hostel.hostelName} className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-900" title={hostel.hostelName}>
                      {hostel.hostelName}
                    </p>
                    <p className="text-[10px] text-gray-500">{hostel.hostelType}</p>
                  </div>
                  <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-[#1360AB]">{hostel.total}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-gray-600">
                  <span className="flex items-center gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    {hostel.checkedIn}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-rose-500" />
                    {hostel.checkedOut}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-purple-500" />
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-sm border-l border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Advanced Filters</h3>
              <button onClick={() => setShowFilters(false)} className="flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100">
                <FiX className="text-base text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 p-4 text-xs">
              <div>
                <label className="mb-1 block font-medium text-gray-700">Search</label>
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full rounded border border-gray-300 bg-white py-1.5 pl-7 pr-2 text-xs focus:border-[#1360AB] focus:outline-none focus:ring-1 focus:ring-[#1360AB]"
                    placeholder="Student, room, reason..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-gray-700">Status</label>
                  <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-[#1360AB] focus:outline-none">
                    <option value="">All</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Checked Out">Checked Out</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-gray-700">Type</label>
                  <select value={filters.isSameHostel} onChange={(e) => handleFilterChange("isSameHostel", e.target.value)} className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-[#1360AB] focus:outline-none">
                    <option value="">All</option>
                    <option value="true">Same Hostel</option>
                    <option value="false">Cross-Hostel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700">Hostel</label>
                <select value={filters.hostelId} onChange={(e) => handleFilterChange("hostelId", e.target.value)} className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-[#1360AB] focus:outline-none">
                  <option value="">All Hostels</option>
                  {hostelList?.map((hostel) => (
                    <option key={hostel._id} value={hostel._id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-gray-700">Start Date</label>
                  <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-[#1360AB] focus:outline-none" />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-gray-700">End Date</label>
                  <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-[#1360AB] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-gray-700">Page Size</label>
                <select value={filters.limit} onChange={(e) => handleLimitChange(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-[#1360AB] focus:outline-none">
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button onClick={resetFilters} className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  Reset All
                </button>
                <button
                  onClick={() => {
                    refresh()
                    setShowFilters(false)
                  }}
                  className="flex-1 rounded bg-[#1360AB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0f4e8a]"
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

export default LiveCheckInOut
