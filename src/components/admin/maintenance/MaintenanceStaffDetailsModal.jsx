import React, { useState, useEffect } from "react"
import { FaHistory, FaCalendarAlt, FaFilter, FaSearch, FaTimes, FaChartBar, FaTasks } from "react-icons/fa"
import Modal from "../../common/Modal"
import { securityApi } from "../../../services/apiService"
import { adminApi } from "../../../services/adminApi"
import Pagination from "../../common/Pagination"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const MaintenanceStaffDetailsModal = ({ staff, onClose }) => {
  const [activeTab, setActiveTab] = useState("attendance")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [workStats, setWorkStats] = useState({ totalWorkDone: 0, todayWorkDone: 0 })
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendanceRecords()
    } else if (activeTab === "workStats") {
      fetchWorkStats()
    }
  }, [currentPage, startDate, endDate, activeTab])

  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const filters = {
        staffType: "maintenance",
        userId: staff.userId,
        page: currentPage,
        limit: itemsPerPage,
      }

      // Add date filters
      if (startDate) {
        filters.startDate = startDate.toISOString()
      }

      if (endDate) {
        filters.endDate = endDate.toISOString()
      }

      const response = await securityApi.getStaffAttendanceRecords(filters)

      if (response.success) {
        setAttendanceRecords(response.records || [])
        setTotalPages(Math.ceil(response.totalCount / itemsPerPage) || 1)
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkStats = async () => {
    setStatsLoading(true)
    try {
      const response = await adminApi.getMaintenanceStaffStats(staff.userId)
      if (response.success) {
        setWorkStats({
          totalWorkDone: response.data.totalWorkDone || 0,
          todayWorkDone: response.data.todayWorkDone || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching work stats:", error)
      setWorkStats({ totalWorkDone: 0, todayWorkDone: 0 })
    } finally {
      setStatsLoading(false)
    }
  }

  const clearFilters = () => {
    setStartDate(null)
    setEndDate(null)
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const tabBaseStyle = {
    padding: "var(--spacing-2) var(--spacing-1)",
    borderBottom: "var(--border-2) solid transparent",
    fontWeight: "var(--font-weight-medium)",
    fontSize: "var(--font-size-sm)",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "var(--transition-colors)"
  }

  const tabActiveStyle = {
    ...tabBaseStyle,
    borderBottomColor: "var(--color-info)",
    color: "var(--color-info)"
  }

  const tabInactiveStyle = {
    ...tabBaseStyle,
    borderBottomColor: "transparent",
    color: "var(--color-text-muted)"
  }

  return (
    <Modal title={`${staff.name} - Details`} onClose={onClose} width={900}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
        {/* Tab Navigation */}
        <div style={{ borderBottom: "var(--border-1) solid var(--color-border-primary)" }}>
          <nav style={{ marginBottom: "-1px", display: "flex", gap: "var(--spacing-8)" }}>
            <button onClick={() => setActiveTab("attendance")} style={activeTab === "attendance" ? tabActiveStyle : tabInactiveStyle}>
              <FaHistory style={{ marginRight: "var(--spacing-2)", display: "inline" }} />
              Attendance History
            </button>
            <button onClick={() => setActiveTab("workStats")} style={activeTab === "workStats" ? tabActiveStyle : tabInactiveStyle}>
              <FaChartBar style={{ marginRight: "var(--spacing-2)", display: "inline" }} />
              Work Statistics
            </button>
          </nav>
        </div>

        {activeTab === "attendance" && (
          <>
            {/* Filters */}
            <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)" }}>
              <h3 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-3)", display: "flex", alignItems: "center" }}>
                <FaFilter style={{ marginRight: "var(--spacing-2)", color: "var(--color-text-muted)" }} /> Filter Records
              </h3>
              <div style={{ display: "flex", flexDirection: "row", gap: "var(--spacing-4)", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>Start Date</label>
                  <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholderText="Select start date & time" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>End Date</label>
                  <DatePicker selected={endDate} onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Select end date & time"
                    minDate={startDate}
                  />
                </div>
                <div>
                  <button onClick={clearFilters} style={{ padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-body)", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", transition: "var(--transition-colors)" }}>
                    <FaTimes style={{ marginRight: "var(--spacing-1)", display: "inline" }} /> Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Content */}
            <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-lg)", border: "var(--border-1) solid var(--color-border-primary)" }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "var(--spacing-12) 0" }}>
                  <div style={{ width: "var(--icon-4xl)", height: "var(--icon-4xl)", border: "var(--border-4) solid var(--color-primary)", borderTopColor: "transparent", borderRadius: "var(--radius-full)", animation: "spin 1s linear infinite" }}></div>
                </div>
              ) : attendanceRecords.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: "var(--color-bg-tertiary)" }}>
                      <tr>
                        <th scope="col" style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wider)" }}>
                          Date
                        </th>
                        <th scope="col" style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wider)" }}>
                          Time
                        </th>
                        <th scope="col" style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wider)" }}>
                          Type
                        </th>
                        <th scope="col" style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wider)" }}>
                          Hostel
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: "var(--color-bg-primary)" }}>
                      {attendanceRecords.map((record) => (
                        <tr key={record._id} style={{ borderTop: "var(--border-1) solid var(--color-border-primary)" }}>
                          <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{formatDate(record.createdAt).split(" ")[0]}</td>
                          <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{formatDate(record.createdAt).split(" ")[1]}</td>
                          <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap" }}>
                            <span style={{ padding: "var(--spacing-0-5) var(--spacing-2)", display: "inline-flex", fontSize: "var(--font-size-xs)", lineHeight: "var(--line-height-snug)", fontWeight: "var(--font-weight-semibold)", borderRadius: "var(--radius-full)", backgroundColor: record.type === "checkIn" ? "var(--color-success-bg)" : "var(--color-danger-bg)", color: record.type === "checkIn" ? "var(--color-success-text)" : "var(--color-danger-text)" }}>{record.type === "checkIn" ? "Check In" : "Check Out"}</span>
                          </td>
                          <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{record.hostelId?.name || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "var(--spacing-8) 0" }}>
                  <p style={{ color: "var(--color-text-muted)" }}>No attendance records found.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {attendanceRecords.length > 0 && (
              <div style={{ marginTop: "var(--spacing-4)" }}>
                <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
              </div>
            )}
          </>
        )}

        {activeTab === "workStats" && (
          <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-lg)", border: "var(--border-1) solid var(--color-border-primary)", padding: "var(--spacing-6)" }}>
            {statsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "var(--spacing-12) 0" }}>
                <div style={{ width: "var(--icon-4xl)", height: "var(--icon-4xl)", border: "var(--border-4) solid var(--color-primary)", borderTopColor: "transparent", borderRadius: "var(--radius-full)", animation: "spin 1s linear infinite" }}></div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-6)" }}>
                {/* Total Work Done */}
                <div style={{ background: "linear-gradient(to right, var(--color-info-bg-light), var(--color-info-bg))", padding: "var(--spacing-6)", borderRadius: "var(--radius-lg)", border: "var(--border-1) solid var(--color-info-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-info-text)", marginBottom: "var(--spacing-2)" }}>Total Work Done</h3>
                      <p style={{ fontSize: "var(--font-size-4xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-info)" }}>{workStats.totalWorkDone}</p>
                      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-info)", marginTop: "var(--spacing-1)" }}>Complaints Resolved</p>
                    </div>
                    <div style={{ padding: "var(--spacing-3)", backgroundColor: "var(--color-info-bg)", borderRadius: "var(--radius-full)" }}>
                      <FaTasks style={{ fontSize: "var(--font-size-3xl)", color: "var(--color-info)" }} />
                    </div>
                  </div>
                </div>

                {/* Today's Work Done */}
                <div style={{ background: "linear-gradient(to right, var(--color-success-bg-light), var(--color-success-bg))", padding: "var(--spacing-6)", borderRadius: "var(--radius-lg)", border: "var(--border-1) solid var(--color-success-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-success-text)", marginBottom: "var(--spacing-2)" }}>Today's Work</h3>
                      <p style={{ fontSize: "var(--font-size-4xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-success)" }}>{workStats.todayWorkDone}</p>
                      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-success)", marginTop: "var(--spacing-1)" }}>Complaints Resolved Today</p>
                    </div>
                    <div style={{ padding: "var(--spacing-3)", backgroundColor: "var(--color-success-bg)", borderRadius: "var(--radius-full)" }}>
                      <FaCalendarAlt style={{ fontSize: "var(--font-size-3xl)", color: "var(--color-success)" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default MaintenanceStaffDetailsModal
