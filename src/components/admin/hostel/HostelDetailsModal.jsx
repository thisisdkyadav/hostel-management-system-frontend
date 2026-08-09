import { useEffect, useState } from "react"
import { CalendarCheck, Filter, X } from "lucide-react"
import { Badge, Button, DatePicker, DetailSection, EmptyState, Field, HStack, LoadingState, Modal, Pagination, Select, Table, Text, VStack } from "hzero"
import { securityApi } from "../../../service"

/**
 * Staff check-in and check-out history for one hostel.
 *
 * The filter bar was a hand-rolled heading over a tinted div; it is a
 * DetailSection now. The two date fields were react-datepicker instances
 * carrying border-gray-300 and focus:ring-blue-500 — literal colours that never
 * themed and were wrong in dark mode — plus a vendor stylesheet that themed no
 * better. They are hzero DatePickers, which makes the filter date-only; the
 * range covers the whole of the end day, which is what "between the 3rd and the
 * 10th" has always meant to the person asking.
 *
 * A second tab's worth of "present staff" markup lived here unreachably: the
 * state behind it had no setter and the renderer was never called. It is gone.
 */

const ITEMS_PER_PAGE = 10

const STAFF_TYPE_OPTIONS = [
  { value: "all", label: "All staff" },
  { value: "security", label: "Security guards" },
  { value: "maintenance", label: "Maintenance staff" },
]

const startOfDay = (value) => new Date(`${value}T00:00:00`).toISOString()
const endOfDay = (value) => new Date(`${value}T23:59:59.999`).toISOString()

const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const HostelDetailsModal = ({ hostel, onClose }) => {
  const [staffType, setStaffType] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
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
          filters.startDate = startOfDay(startDate)
        }

        if (endDate) {
          filters.endDate = endOfDay(endDate)
        }

        // Add hostel ID filter
        filters.hostelId = hostel.id

        // Add pagination
        filters.page = currentPage
        filters.limit = ITEMS_PER_PAGE

        // Fetch attendance records
        const response = await securityApi.getStaffAttendanceRecords(filters)
        if (response.success) {
          setAttendanceRecords(response.records || [])
          setTotalPages(Math.ceil(response.totalCount / ITEMS_PER_PAGE) || 1)
        }
      } catch (error) {
        console.error("Error fetching attendance records:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceRecords()
  }, [staffType, startDate, endDate, currentPage, hostel.id])

  const clearFilters = () => {
    setStaffType("all")
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const filtered = staffType !== "all" || Boolean(startDate) || Boolean(endDate)

  const renderAttendanceEntries = () => {
    if (loading) {
      return <LoadingState message="Loading attendance records…" />
    }

    if (attendanceRecords.length === 0) {
      return (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records"
          message={filtered ? "Nothing matches these filters. Clear them to see everything." : "No staff has checked in at this hostel yet."}
        />
      )
    }

    return (
      <>
        <Table bordered striped>
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
                  <Text as="div" size="sm" weight="medium" color="primary">{record.userId.name}</Text>
                  <Text as="div" size="sm" color="muted">{record.userId.email}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant={record.userId.role === "Security" ? "purple" : "primary"} size="small">
                    {record.userId.role}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{formatDate(record.createdAt)}</Table.Cell>
                <Table.Cell>
                  <Badge variant={record.type === "checkIn" ? "success" : "danger"} size="small">
                    {record.type === "checkIn" ? "Check in" : "Check out"}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {totalPages > 1 && (
          <HStack justify="center">
            <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
          </HStack>
        )}
      </>
    )
  }

  return (
    <Modal isOpen onClose={onClose} title={`${hostel.name} — staff attendance`} width={900}>
      <VStack gap="large">
        <DetailSection
          title="Filter records"
          icon={Filter}
          columns={2}
          actions={<Button onClick={clearFilters} variant="secondary" size="sm"><X size={14} /> Clear</Button>}
        >
          <Field label="Staff type" htmlFor="staff-type">
            <Select
              id="staff-type"
              name="staffType"
              value={staffType}
              onChange={(e) => setStaffType(e.target.value)}
              options={STAFF_TYPE_OPTIONS}
            />
          </Field>
          <Field label="From" htmlFor="attendance-from">
            <DatePicker
              id="attendance-from"
              name="attendanceFrom"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Any date"
            />
          </Field>
          <Field label="To" htmlFor="attendance-to">
            <DatePicker
              id="attendance-to"
              name="attendanceTo"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Any date"
            />
          </Field>
        </DetailSection>

        {renderAttendanceEntries()}
      </VStack>
    </Modal>
  )
}

export default HostelDetailsModal
