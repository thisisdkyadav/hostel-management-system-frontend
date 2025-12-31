import React, { useState, useEffect } from "react"
import { FaHistory, FaCalendarAlt, FaFilter, FaSearch, FaTimes, FaChartBar, FaTasks } from "react-icons/fa"
import { Modal, Button, VStack, HStack, Label, Spinner, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, Badge, Tabs, TabList, Tab, StatCards } from "@/components/ui"
import { securityApi } from "../../../service"
import { adminApi } from "../../../service"
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
    <Modal isOpen={true} title={`${staff.name} - Details`} onClose={onClose} width={900}>
      <VStack gap="large">
        {/* Tab Navigation */}
        <Tabs>
          <TabList>
            <Tab isSelected={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} icon={<FaHistory />}>
              Attendance History
            </Tab>
            <Tab isSelected={activeTab === "workStats"} onClick={() => setActiveTab("workStats")} icon={<FaChartBar />}>
              Work Statistics
            </Tab>
          </TabList>
        </Tabs>

        {activeTab === "attendance" && (
          <>
            {/* Filters */}
            <div style={{ backgroundColor: "var(--color-bg-tertiary)", padding: "var(--spacing-4)", borderRadius: "var(--radius-lg)" }}>
              <h3 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-3)", display: "flex", alignItems: "center" }}>
                <FaFilter style={{ marginRight: "var(--spacing-2)", color: "var(--color-text-muted)" }} /> Filter Records
              </h3>
              <HStack gap="medium" align="end">
                <div style={{ flex: 1 }}>
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholderText="Select start date & time" />
                </div>
                <div style={{ flex: 1 }}>
                  <Label htmlFor="endDate">End Date</Label>
                  <DatePicker selected={endDate} onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Select end date & time"
                    minDate={startDate}
                  />
                </div>
                <div>
                  <Button onClick={clearFilters} variant="secondary" size="small" icon={<FaTimes />}>
                    Clear
                  </Button>
                </div>
              </HStack>
            </div>

            {/* Attendance Content */}
            <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-lg)", border: "var(--border-1) solid var(--color-border-primary)" }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "var(--spacing-12) 0" }}>
                  <Spinner size="large" />
                </div>
              ) : attendanceRecords.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Time</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Hostel</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>{formatDate(record.createdAt).split(" ")[0]}</TableCell>
                        <TableCell>{formatDate(record.createdAt).split(" ")[1]}</TableCell>
                        <TableCell>
                          <Badge variant={record.type === "checkIn" ? "success" : "danger"}>
                            {record.type === "checkIn" ? "Check In" : "Check Out"}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.hostelId?.name || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  title="No Records Found"
                  description="No attendance records found for the selected filters."
                />
              )}
            </div>

            {/* Pagination */}
            {attendanceRecords.length > 0 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
            )}
          </>
        )}

        {activeTab === "workStats" && (
          <div style={{ backgroundColor: "var(--color-bg-primary)", borderRadius: "var(--radius-lg)", border: "var(--border-1) solid var(--color-border-primary)", padding: "var(--spacing-6)" }}>
            {statsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "var(--spacing-12) 0" }}>
                <Spinner size="large" />
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
      </VStack>
    </Modal>
  )
}

export default MaintenanceStaffDetailsModal
