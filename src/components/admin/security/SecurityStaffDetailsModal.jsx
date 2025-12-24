import React, { useState, useEffect } from "react"
import { FaHistory, FaCalendarAlt, FaFilter, FaSearch, FaTimes } from "react-icons/fa"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import { securityApi } from "../../../services/apiService"
import Pagination from "../../common/Pagination"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const SecurityStaffDetailsModal = ({ staff, onClose }) => {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchAttendanceRecords()
  }, [currentPage, startDate, endDate])

  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const filters = {
        staffType: "security",
        userId: staff.userId || staff._id,
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

  return (
    <Modal title={`${staff.name} - Attendance History`} onClose={onClose} width={900}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {/* Filters */}
        <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center' }}>
            <FaFilter style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-text-muted)' }} /> Filter Records
          </h3>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-4)', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>Start Date</label>
              <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" style={{ width: '100%', padding: 'var(--spacing-2)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-md)', outline: 'none' }} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholderText="Select start date & time" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>End Date</label>
              <DatePicker selected={endDate} onChange={(date) => setEndDate(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                style={{ width: '100%', padding: 'var(--spacing-2)', border: `var(--border-1) solid var(--color-border-input)`, borderRadius: 'var(--radius-md)', outline: 'none' }}
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
          </div>
        </div>

        {/* Content */}
        <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', border: `var(--border-1) solid var(--color-border-primary)` }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-12) 0' }}>
              <div style={{ width: 'var(--spacing-12)', height: 'var(--spacing-12)', border: `var(--border-4) solid var(--color-primary)`, borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : attendanceRecords.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
                  <tr>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                      Date
                    </th>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                      Time
                    </th>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                      Type
                    </th>
                    <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                      Hostel
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  {attendanceRecords.map((record) => (
                    <tr key={record._id} style={{ borderTop: `var(--border-1) solid var(--table-border)` }}>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{formatDate(record.createdAt).split(" ")[0]}</td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{formatDate(record.createdAt).split(" ")[1]}</td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                        <span style={{ padding: 'var(--spacing-0-5) var(--spacing-2)', display: 'inline-flex', fontSize: 'var(--font-size-xs)', lineHeight: 'var(--line-height-tight)', fontWeight: 'var(--font-weight-semibold)', borderRadius: 'var(--radius-full)', backgroundColor: record.type === "checkIn" ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: record.type === "checkIn" ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>{record.type === "checkIn" ? "Check In" : "Check Out"}</span>
                      </td>
                      <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{record.hostelId?.name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No attendance records found.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {attendanceRecords.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
          </div>
        )}
      </div>
    </Modal>
  )
}

export default SecurityStaffDetailsModal
