import React, { useState, useEffect } from "react"
import { Filter, Calendar, UserCog, Users, Search, UserCheck, Check, X } from "lucide-react"
import { Select, Label, VStack, HStack, Badge, Spinner, Pagination } from "@/components/ui"
import { Button, Table, Modal } from "czero/react"
import { securityApi } from "../../../service"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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
          <Spinner size="lg" />
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
        <Table style={{ marginTop: 'var(--spacing-4)' }}>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Role</Table.Head>
              <Table.Head>Time</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {attendanceRecords.map((record) => (
              <Table.Row key={record._id}>
                <Table.Cell>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{record.userId.name}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{record.userId.email}</div>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant={record.userId.role === "Security" ? "purple" : "primary"}>
                    {record.userId.role}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{formatDate(record.createdAt)}</Table.Cell>
                <Table.Cell>
                  <Badge variant={record.type === "checkIn" ? "success" : "danger"}>
                    {record.type === "checkIn" ? "Check In" : "Check Out"}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={paginate} />
          </div>
        )}
      </>
    )
  }

  const renderPresentStaff = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-12) 0' }}>
          <Spinner size="lg" />
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
      <Table style={{ marginTop: 'var(--spacing-4)' }}>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Role</Table.Head>
            <Table.Head>Email</Table.Head>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {presentStaff.map((staff) => (
            <Table.Row key={staff._id}>
              <Table.Cell>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{staff.name}</div>
              </Table.Cell>
              <Table.Cell>
                <Badge variant={staff.role === "Security" ? "purple" : "primary"}>
                  {staff.role}
                </Badge>
              </Table.Cell>
              <Table.Cell>{staff.email}</Table.Cell>
              <Table.Cell>
                <Badge variant="success" icon={<Check size={12} />}>
                  Present
                </Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`${hostel.name} - Staff Attendance`} width={900}>
      <VStack gap="large">
        {/* Filters */}
        <div style={{ backgroundColor: 'var(--color-bg-hover)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', width: '100%' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-body)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center' }}>
            <Filter size={14} style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-text-muted)' }} /> Filter Records
          </h3>
          <HStack gap="medium" align="end" wrap>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <Label>Staff Type</Label>
              <Select value={staffType} onChange={(e) => setStaffType(e.target.value)} options={[{ value: "all", label: "All Staff" }, { value: "security", label: "Security Guards" }, { value: "maintenance", label: "Maintenance Staff" }]} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <Label>Start Date</Label>
              <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholderText="Select start date & time" />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <Label>End Date</Label>
              <DatePicker selected={endDate} onChange={(date) => setEndDate(date)}
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select end date & time"
                minDate={startDate}
              />
            </div>
            <div>
              <Button
                onClick={clearFilters}
                variant="secondary"
                size="sm"
              >
                <X size={14} />
                Clear
              </Button>
            </div>
          </HStack>
        </div>

        {/* Content */}
        <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', border: 'var(--border-1) solid var(--color-border-primary)', width: '100%' }}>{renderAttendanceEntries()}</div>
      </VStack>
    </Modal>
  )
}

export default HostelDetailsModal
