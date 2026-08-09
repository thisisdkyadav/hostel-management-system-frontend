import { useEffect, useState } from "react"
import { CalendarCheck, CircleCheck, Filter, ListChecks, X } from "lucide-react"
import { Badge, Button, DatePicker, DetailSection, EmptyState, Field, HStack, LoadingState, Modal, Pagination, StatCards, Table, VStack } from "hzero"
import { adminApi, securityApi } from "../../../service"

/**
 * A staff member's attendance history, and what they got done.
 *
 * Security and maintenance had one of these each, 405 lines between them and
 * identical apart from a work-statistics tab. The tab is gone: it held two
 * numbers, and two numbers do not need to be hidden behind a click.
 *
 * The date filters were react-datepicker instances styled with border-gray-300
 * and focus:ring-blue-500 — literal colours that never themed and were plain
 * wrong in dark mode. They are hzero DatePickers now, which means the filter is
 * date-only; the range is widened to cover the whole of the end day, which is
 * what "between the 3rd and the 10th" has always meant to the person asking.
 */

const PAGE_SIZE = 10

const startOfDay = (value) => (value ? new Date(`${value}T00:00:00`).toISOString() : undefined)
const endOfDay = (value) => (value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined)

const StaffAttendanceModal = ({ staff, staffType, showWorkStats = false, onClose }) => {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [records, setRecords] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [work, setWork] = useState(null)

  const userId = staff.userId || staff._id

  useEffect(() => {
    let live = true
    const run = async () => {
      try {
        const response = await securityApi.getStaffAttendanceRecords({
          staffType,
          userId,
          page,
          limit: PAGE_SIZE,
          ...(from ? { startDate: startOfDay(from) } : null),
          ...(to ? { endDate: endOfDay(to) } : null),
        })
        if (!live) return
        if (response?.success) {
          setRecords(response.records || [])
          setTotalPages(Math.ceil(response.totalCount / PAGE_SIZE) || 1)
        }
      } catch (error) {
        console.error("Error loading attendance records:", error)
        if (live) setRecords([])
      } finally {
        if (live) setLoading(false)
      }
    }
    run()
    return () => { live = false }
  }, [staffType, userId, page, from, to])

  useEffect(() => {
    if (!showWorkStats) return
    let live = true
    const run = async () => {
      try {
        const response = await adminApi.getMaintenanceStaffStats(userId)
        if (live && response?.success) setWork(response.data)
      } catch (error) {
        console.error("Error loading work statistics:", error)
        if (live) setWork(null)
      }
    }
    run()
    return () => { live = false }
  }, [showWorkStats, userId])

  const clear = () => {
    setFrom("")
    setTo("")
    setPage(1)
  }

  const filtered = Boolean(from || to)

  return (
    <Modal isOpen title={`${staff.name} — attendance`} onClose={onClose} width={900}>
      <VStack gap="large">
        {showWorkStats && (
          <StatCards
            columns={2}
            stats={[
              { title: "Complaints resolved", value: work?.totalWorkDone ?? 0, subtitle: "All time", icon: <ListChecks />, color: "var(--color-info)" },
              { title: "Resolved today", value: work?.todayWorkDone ?? 0, subtitle: "Since midnight", icon: <CircleCheck />, color: "var(--color-success)" },
            ]}
          />
        )}

        <DetailSection
          title="Filter records"
          icon={Filter}
          actions={filtered ? <Button onClick={clear} variant="secondary" size="sm"><X /> Clear</Button> : undefined}
          columns={2}
        >
          <Field label="From" htmlFor="from">
            <DatePicker name="from" id="from" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} placeholder="Any date" />
          </Field>
          <Field label="To" htmlFor="to">
            <DatePicker name="to" id="to" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1) }} placeholder="Any date" />
          </Field>
        </DetailSection>

        {loading ? (
          <LoadingState message="Loading attendance records…" />
        ) : records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            message={filtered ? "Nothing in that date range." : "This staff member has not checked in yet."}
          />
        ) : (
          <>
            <Table bordered striped>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Time</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>Hostel</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {records.map((record) => {
                  const at = record.createdAt ? new Date(record.createdAt) : null
                  return (
                    <Table.Row key={record._id}>
                      <Table.Cell>{at ? at.toLocaleDateString() : "—"}</Table.Cell>
                      <Table.Cell>{at ? at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</Table.Cell>
                      <Table.Cell>
                        <Badge variant={record.type === "checkIn" ? "success" : "danger"} size="small">
                          {record.type === "checkIn" ? "Check in" : "Check out"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{record.hostelId?.name || "—"}</Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>

            {totalPages > 1 && (
              <HStack justify="center">
                <Pagination currentPage={page} totalPages={totalPages} paginate={setPage} />
              </HStack>
            )}
          </>
        )}
      </VStack>
    </Modal>
  )
}

export default StaffAttendanceModal
