import { useEffect, useMemo, useState } from "react"
import { Button, DataTable, Modal } from "czero/react"
import { Eye } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { Badge, Select, Textarea, useToast } from "@/components/ui"
import { jrAppointmentsApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"

const cardStyle = {
  border: "var(--border-1) solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-primary)",
  padding: "var(--spacing-4)",
}

const sectionTitleStyle = {
  margin: 0,
  color: "var(--color-text-primary)",
  fontSize: "var(--font-size-lg)",
  fontWeight: "var(--font-weight-semibold)",
}

const entryBadge = (entered) => (entered ? "success" : "warning")

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const formatDateTime = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString()
}

const JRAppointmentsGatePage = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  const isGateUser = user?.role === "Hostel Gate"

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState("today")
  const [entryStatus, setEntryStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [entryNote, setEntryNote] = useState("")
  const [entrySubmitting, setEntrySubmitting] = useState(false)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await jrAppointmentsApi.getGateAppointments({
        page,
        limit: 20,
        dateFilter,
        entryStatus: entryStatus === "all" ? undefined : entryStatus,
      })

      setAppointments(response.items || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      toast.error(error.message || "Failed to fetch gate appointments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isGateUser) return
    fetchAppointments()
  }, [isGateUser, page, dateFilter, entryStatus])

  const openDetails = (row) => {
    setSelectedAppointment(row)
    setEntryNote("")
    setDetailsOpen(true)
  }

  const closeDetails = () => {
    setDetailsOpen(false)
    setSelectedAppointment(null)
    setEntryNote("")
  }

  const handleMarkEntered = async () => {
    if (!selectedAppointment?.id) return

    try {
      setEntrySubmitting(true)
      const response = await jrAppointmentsApi.markGateEntry(selectedAppointment.id, {
        note: entryNote,
      })

      toast.success(response.message || "Visitor marked as entered")
      const updated = response.appointment
      setSelectedAppointment(updated)
      await fetchAppointments()
    } catch (error) {
      toast.error(error.message || "Failed to mark visitor entry")
    } finally {
      setEntrySubmitting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "visitorName",
        header: "Visitor",
        render: (item) => (
          <div>
            <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
              {item.visitorName}
            </div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              {item.mobileNumber}
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        render: (item) => item.email,
      },
      {
        key: "id",
        header: "ID",
        render: (item) => `${item.idType}: ${item.idNumber}`,
      },
      {
        key: "meeting",
        header: "Approved Meeting",
        render: (item) => `${formatDate(item.approvedMeeting?.date)} | ${item.approvedMeeting?.time || "-"}`,
      },
      {
        key: "entry",
        header: "Entry Status",
        render: (item) => (
          <Badge variant={entryBadge(item.gateEntry?.entered)}>
            {item.gateEntry?.entered ? "Entered" : "Pending"}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (item) => (
          <Button
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              openDetails(item)
            }}
          >
            <Eye size={14} /> View
          </Button>
        ),
      },
    ],
    []
  )

  if (!isGateUser) {
    return (
      <div className="flex-1">
        <PageHeader title="JR Appointments" subtitle="Access denied" />
      </div>
    )
  }

  return (
    <div className="flex-1">
      <PageHeader title="JR Appointments" subtitle="Approved visitor appointments for main gate">
        <div style={{ width: "170px" }}>
          <Select
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value)
              setPage(1)
            }}
            options={[
              { value: "today", label: "Today" },
              { value: "all", label: "All" },
            ]}
          />
        </div>
        <div style={{ width: "170px" }}>
          <Select
            value={entryStatus}
            onChange={(event) => {
              setEntryStatus(event.target.value)
              setPage(1)
            }}
            options={[
              { value: "all", label: "All Entries" },
              { value: "pending", label: "Pending" },
              { value: "entered", label: "Entered" },
            ]}
          />
        </div>
      </PageHeader>

      <div style={{ padding: "var(--spacing-4) var(--spacing-6)" }}>
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <h3 style={sectionTitleStyle}>Approved Requests</h3>
          <DataTable
            columns={columns}
            data={appointments}
            loading={loading}
            emptyMessage="No approved JR appointments found"
            onRowClick={openDetails}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "var(--spacing-2)" }}>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </Button>
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title={selectedAppointment ? `JR Appointment #${selectedAppointment.id?.slice(-6)}` : "JR Appointment"}
        onClose={closeDetails}
        width={860}
        isOpen={detailsOpen}
      >
        {!selectedAppointment ? (
          <div style={{ color: "var(--color-text-muted)" }}>Appointment details unavailable</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Visitor</div>
                <div style={{ color: "var(--color-text-body)", fontWeight: "var(--font-weight-semibold)" }}>
                  {selectedAppointment.visitorName}
                </div>
                <div style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                  {selectedAppointment.mobileNumber}
                </div>
                <div style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                  {selectedAppointment.email}
                </div>
              </div>

              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Identity</div>
                <div style={{ color: "var(--color-text-body)" }}>
                  {selectedAppointment.idType}: {selectedAppointment.idNumber}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-2)" }}>
                  Approved Meeting
                </div>
                <div style={{ color: "var(--color-text-body)" }}>
                  {formatDate(selectedAppointment.approvedMeeting?.date)} | {selectedAppointment.approvedMeeting?.time || "-"}
                </div>
              </div>

              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Entry Status</div>
                <Badge variant={entryBadge(selectedAppointment.gateEntry?.entered)}>
                  {selectedAppointment.gateEntry?.entered ? "Entered" : "Pending"}
                </Badge>
                {selectedAppointment.gateEntry?.enteredAt ? (
                  <div style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-2)" }}>
                    Entered At: {formatDateTime(selectedAppointment.gateEntry.enteredAt)}
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ ...cardStyle, padding: "var(--spacing-3)" }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-1)" }}>
                Reason for Meeting
              </div>
              <div style={{ color: "var(--color-text-body)", whiteSpace: "pre-wrap" }}>{selectedAppointment.reason}</div>
            </div>

            {!selectedAppointment.gateEntry?.entered ? (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <h4 style={sectionTitleStyle}>Mark Entry</h4>
                <Textarea
                  rows={3}
                  placeholder="Optional gate note"
                  value={entryNote}
                  onChange={(event) => setEntryNote(event.target.value)}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="success" loading={entrySubmitting} onClick={handleMarkEntered}>
                    Mark as Entered
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ ...cardStyle, padding: "var(--spacing-3)", color: "var(--color-text-body)" }}>
                Visitor entry already marked by {selectedAppointment.gateEntry?.markedBy?.name || "Hostel Gate"}.
                {selectedAppointment.gateEntry?.note ? ` Note: ${selectedAppointment.gateEntry.note}` : ""}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default JRAppointmentsGatePage
