import React, { useState, useEffect } from "react"
import { FaHistory, FaCalendarAlt, FaFilter, FaSearch, FaTimes } from "react-icons/fa"
import { Modal, VStack, HStack, Label, Spinner, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, Badge } from "@/components/ui"
import { Button } from "czero/react"
import { securityApi } from "../../../service"
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
    <Modal isOpen={true} title={`${staff.name} - Attendance History`} onClose={onClose} width={900}>
      <VStack gap="large">
        {/* Filters */}
        <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center' }}>
            <FaFilter style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-text-muted)' }} /> Filter Records
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
              <Button onClick={clearFilters} variant="secondary" size="sm">
                <FaTimes /> Clear
              </Button>
            </div>
          </HStack>
        </div>

        {/* Content */}
        <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', border: `var(--border-1) solid var(--color-border-primary)` }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-12) 0' }}>
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
      </VStack>
    </Modal>
  )
}

export default SecurityStaffDetailsModal
