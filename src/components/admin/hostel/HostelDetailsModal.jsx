import React, { useState, useEffect } from "react"
import { FaFilter, FaCalendarAlt, FaUserCog, FaUsers, FaSearch, FaUserCheck, FaCheck, FaTimes } from "react-icons/fa"
import Modal from "../../common/Modal"
import { securityApi } from "../../../services/apiService"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Pagination from "../../common/Pagination"

const HostelDetailsModal = ({ hostel, onClose }) => {
  const [activeTab, setActiveTab] = useState("entries")
  const [staffType, setStaffType] = useState("all")
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [presentStaff, setPresentStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateRangeMode, setDateRangeMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchAttendanceRecords()
  }, [staffType, startDate, endDate, currentPage])

  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const filters = {}

      // Add staff type filter if not "all"
      if (staffType !== "all") {
        filters.staffType = staffType
      }

      // Add date filters
      if (startDate) {
        filters.startDate = startDate.toISOString()
      }

      if (endDate) {
        filters.endDate = endDate.toISOString()
      }

      // Add hostel ID filter
      filters.hostelId = hostel.id

      // Add pagination
      filters.page = currentPage
      filters.limit = itemsPerPage

      // Fetch attendance records
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
    setStaffType("all")
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

  const renderAttendanceEntries = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-12) 0' }}>
          <div style={{ width: 'var(--spacing-12)', height: 'var(--spacing-12)', border: 'var(--border-4) solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
        </div>
      )
    }

    if (attendanceRecords.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No attendance records found.</p>
        </div>
      )
    }

    return (
      <>
        <div style={{ overflowX: 'auto', marginTop: 'var(--spacing-4)' }}>
          <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
              <tr>
                <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                  Name
                </th>
                <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                  Role
                </th>
                <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                  Time
                </th>
                <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              {attendanceRecords.map((record) => (
                <tr key={record._id} style={{ borderTop: 'var(--border-1) solid var(--color-border-primary)' }}>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{record.userId.name}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{record.userId.email}</div>
                  </td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                    <span style={{ padding: 'var(--spacing-0-5) var(--spacing-2)', display: 'inline-flex', fontSize: 'var(--font-size-xs)', lineHeight: '1.25rem', fontWeight: 'var(--font-weight-semibold)', borderRadius: 'var(--radius-full)', backgroundColor: record.userId.role === "Security" ? 'var(--color-purple-light-bg)' : 'var(--color-primary-bg)', color: record.userId.role === "Security" ? 'var(--color-purple-text)' : 'var(--color-primary-dark)' }}>{record.userId.role}</span>
                  </td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{formatDate(record.createdAt)}</td>
                  <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                    <span style={{ padding: 'var(--spacing-0-5) var(--spacing-2)', display: 'inline-flex', fontSize: 'var(--font-size-xs)', lineHeight: '1.25rem', fontWeight: 'var(--font-weight-semibold)', borderRadius: 'var(--radius-full)', backgroundColor: record.type === "checkIn" ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: record.type === "checkIn" ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>{record.type === "checkIn" ? "Check In" : "Check Out"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
          </div>
        )}
      </>
    )
  }

  const renderPresentStaff = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-12) 0' }}>
          <div style={{ width: 'var(--spacing-12)', height: 'var(--spacing-12)', border: 'var(--border-4) solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: 'var(--radius-full)', animation: 'spin 1s linear infinite' }}></div>
        </div>
      )
    }

    if (presentStaff.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No staff present during the selected time period.</p>
        </div>
      )
    }

    return (
      <div style={{ overflowX: 'auto', marginTop: 'var(--spacing-4)' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
            <tr>
              <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                Name
              </th>
              <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                Role
              </th>
              <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                Email
              </th>
              <th scope="col" style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)' }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {presentStaff.map((staff) => (
              <tr key={staff._id} style={{ borderTop: 'var(--border-1) solid var(--color-border-primary)' }}>
                <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{staff.name}</div>
                </td>
                <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                  <span style={{ padding: 'var(--spacing-0-5) var(--spacing-2)', display: 'inline-flex', fontSize: 'var(--font-size-xs)', lineHeight: '1.25rem', fontWeight: 'var(--font-weight-semibold)', borderRadius: 'var(--radius-full)', backgroundColor: staff.role === "Security" ? 'var(--color-purple-light-bg)' : 'var(--color-primary-bg)', color: staff.role === "Security" ? 'var(--color-purple-text)' : 'var(--color-primary-dark)' }}>{staff.role}</span>
                </td>
                <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{staff.email}</td>
                <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', whiteSpace: 'nowrap' }}>
                  <span style={{ padding: 'var(--spacing-0-5) var(--spacing-2)', display: 'inline-flex', alignItems: 'center', fontSize: 'var(--font-size-xs)', lineHeight: '1.25rem', fontWeight: 'var(--font-weight-semibold)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>
                    <FaCheck style={{ marginRight: 'var(--spacing-1)' }} /> Present
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <Modal title={`${hostel.name} - Staff Attendance`} onClose={onClose} width={900}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {/* View Type Selector - Hidden for now */}
        {/* <div className="flex justify-center mb-4">
          <div className="inline-flex p-1 bg-gray-100 rounded-lg">
            <button onClick={() => setDateRangeMode(false)}
              className={`px-4 py-2 rounded-md ${!dateRangeMode ? 'bg-white shadow-sm text-[#1360AB]' : 'text-gray-600'}`}
            >
              <FaUserCog className="inline mr-2" /> Attendance Entries
            </button>
            <button onClick={() => setDateRangeMode(true)}
              className={`px-4 py-2 rounded-md ${dateRangeMode ? 'bg-white shadow-sm text-[#1360AB]' : 'text-gray-600'}`}
            >
              <FaUserCheck className="inline mr-2" /> Staff Present
            </button>
          </div>
        </div> */}

        {/* Filters */}
        <div style={{ backgroundColor: 'var(--color-bg-hover)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center' }}>
            <FaFilter style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-text-muted)' }} /> Filter Records
          </h3>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--spacing-4)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Staff Type</label>
              <select value={staffType} onChange={(e) => setStaffType(e.target.value)} style={{ width: '100%', padding: 'var(--spacing-2)', border: 'var(--border-1) solid var(--color-border-input)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'var(--transition-all)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }}>
                <option value="all">All Staff</option>
                <option value="security">Security Guards</option>
                <option value="maintenance">Maintenance Staff</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>Start Date</label>
              <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholderText="Select start date & time" />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-1)' }}>End Date</label>
              <DatePicker selected={endDate} onChange={(date) => setEndDate(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select end date & time"
                minDate={startDate}
              />
            </div>
            <div>
              <button onClick={clearFilters} style={{ padding: 'var(--spacing-2)', backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-body)', borderRadius: 'var(--radius-md)', transition: 'var(--transition-colors)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}>
                <FaTimes style={{ marginRight: 'var(--spacing-1)', display: 'inline' }} /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', border: 'var(--border-1) solid var(--color-border-primary)' }}>{renderAttendanceEntries()}</div>
      </div>
    </Modal>
  )
}

export default HostelDetailsModal
