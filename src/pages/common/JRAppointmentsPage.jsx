import { useEffect, useMemo, useState } from "react"
import { Button, DataTable, Modal } from "czero/react"
import { Eye } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { Badge, Input, Select, Textarea, useToast } from "@/components/ui"
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

const statusVariant = (status) => {
  switch (status) {
    case "Approved":
      return "success"
    case "Rejected":
      return "danger"
    default:
      return "warning"
  }
}

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

const toDateInput = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0]
}

const todayDateInput = () => {
  const today = new Date()
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0]
}

const JRAppointmentsPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  const isJRAdmin = user?.role === "Admin" && user?.subRole === "Joint Registrar SA"

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [selectedId, setSelectedId] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const [reviewAction, setReviewAction] = useState("approve")
  const [reviewDescription, setReviewDescription] = useState("")
  const [approvedDate, setApprovedDate] = useState("")
  const [approvedTime, setApprovedTime] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const fetchAppointments = async (overrides = {}) => {
    const targetPage = overrides.page || page
    const targetStatus = Object.prototype.hasOwnProperty.call(overrides, "status")
      ? overrides.status
      : statusFilter
    const targetSearch = Object.prototype.hasOwnProperty.call(overrides, "search")
      ? overrides.search
      : searchValue

    try {
      setLoading(true)
      const response = await jrAppointmentsApi.getAdminAppointments({
        page: targetPage,
        limit: 10,
        status: targetStatus || undefined,
        search: targetSearch || undefined,
      })
      setAppointments(response.items || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      toast.error(error.message || "Failed to fetch appointments")
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointmentById = async (appointmentId) => {
    try {
      setDetailsLoading(true)
      const response = await jrAppointmentsApi.getAdminAppointmentById(appointmentId)
      const appointment = response.appointment || null
      setSelectedAppointment(appointment)

      if (appointment?.status === "Pending") {
        setReviewAction("approve")
        setReviewDescription("")
        setApprovedDate(toDateInput(appointment.preferredDate) || todayDateInput())
        setApprovedTime(appointment.preferredTime || "")
      } else {
        setReviewDescription(appointment?.review?.description || "")
        setApprovedDate(toDateInput(appointment?.approvedMeeting?.date))
        setApprovedTime(appointment?.approvedMeeting?.time || "")
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch appointment details")
      setSelectedAppointment(null)
    } finally {
      setDetailsLoading(false)
    }
  }

  const refreshData = async () => {
    await fetchAppointments()
    if (selectedId) {
      await fetchAppointmentById(selectedId)
    }
  }

  useEffect(() => {
    if (!isJRAdmin) return
    fetchAppointments()
  }, [isJRAdmin, page, statusFilter])

  const handleSearch = async () => {
    setPage(1)
    await fetchAppointments({ page: 1, search: searchValue, status: statusFilter })
  }

  const handleOpenDetails = async (row) => {
    setSelectedId(row.id)
    setDetailsOpen(true)
    await fetchAppointmentById(row.id)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setSelectedId(null)
    setSelectedAppointment(null)
  }

  const handleReviewSubmit = async () => {
    if (!selectedAppointment?.id) return

    if (reviewAction === "reject" && !reviewDescription.trim()) {
      toast.error("Rejection description is required")
      return
    }

    if (reviewAction === "approve") {
      if (!approvedDate || !approvedTime) {
        toast.error("Approved date and time are required")
        return
      }
    }

    try {
      setReviewSubmitting(true)
      const response = await jrAppointmentsApi.reviewAppointment(selectedAppointment.id, {
        action: reviewAction,
        description: reviewDescription,
        approvedDate: reviewAction === "approve" ? approvedDate : undefined,
        approvedTime: reviewAction === "approve" ? approvedTime : undefined,
      })
      toast.success(response.message || "Appointment updated")
      await refreshData()
    } catch (error) {
      toast.error(error.message || "Failed to update appointment")
    } finally {
      setReviewSubmitting(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "visitorName",
        header: "Visitor",
        render: (item) => (
          <div>
            <div style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{item.visitorName}</div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{item.mobileNumber}</div>
          </div>
        ),
      },
      {
        key: "identity",
        header: "Identity",
        render: (item) => `${item.idType}: ${item.idNumber}`,
      },
      {
        key: "preferred",
        header: "Preferred Meeting",
        render: (item) => `${formatDate(item.preferredDate)} | ${item.preferredTime}`,
      },
      {
        key: "status",
        header: "Status",
        render: (item) => <Badge variant={statusVariant(item.status)}>{item.status}</Badge>,
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
              handleOpenDetails(item)
            }}
          >
            <Eye size={14} /> View
          </Button>
        ),
      },
    ],
    []
  )

  if (!isJRAdmin) {
    return (
      <div className="flex-1">
        <PageHeader title="JR Appointments" subtitle="Access denied" />
      </div>
    )
  }

  return (
    <div className="flex-1">
      <PageHeader title="JR Appointments" subtitle="Review requests to meet Joint Registrar">
        <div style={{ width: "220px" }}>
          <Input
            placeholder="Search name/mobile/id"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch()
            }}
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch}>
          Search
        </Button>
        <div style={{ width: "180px" }}>
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setPage(1)
            }}
            options={[
              { value: "", label: "All Status" },
              { value: "Pending", label: "Pending" },
              { value: "Approved", label: "Approved" },
              { value: "Rejected", label: "Rejected" },
            ]}
          />
        </div>
      </PageHeader>

      <div style={{ padding: "var(--spacing-4) var(--spacing-6)" }}>
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <h3 style={sectionTitleStyle}>All Requests</h3>
          <DataTable
            columns={columns}
            data={appointments}
            loading={loading}
            emptyMessage="No JR appointment requests found"
            onRowClick={handleOpenDetails}
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
        onClose={handleCloseDetails}
        width={920}
        isOpen={detailsOpen}
      >
        {detailsLoading ? (
          <div style={{ color: "var(--color-text-muted)" }}>Loading appointment details...</div>
        ) : !selectedAppointment ? (
          <div style={{ color: "var(--color-text-muted)" }}>Appointment details unavailable</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", justifyContent: "space-between", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>
                  {selectedAppointment.visitorName}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  {selectedAppointment.email}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  {selectedAppointment.mobileNumber}
                </div>
              </div>
              <Badge variant={statusVariant(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
            </div>

            <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Identity</div>
                <div style={{ color: "var(--color-text-body)" }}>
                  {selectedAppointment.idType}: {selectedAppointment.idNumber}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Preferred Meeting</div>
                <div style={{ color: "var(--color-text-body)" }}>
                  {formatDate(selectedAppointment.preferredDate)} | {selectedAppointment.preferredTime}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Submitted At</div>
                <div style={{ color: "var(--color-text-body)" }}>{formatDateTime(selectedAppointment.createdAt)}</div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: "var(--spacing-3)" }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-1)" }}>
                Reason for Meeting
              </div>
              <div style={{ color: "var(--color-text-body)", whiteSpace: "pre-wrap" }}>{selectedAppointment.reason}</div>
            </div>

            {selectedAppointment.status === "Pending" ? (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <h4 style={sectionTitleStyle}>Review Request</h4>
                <div style={{ maxWidth: "220px" }}>
                  <Select
                    value={reviewAction}
                    onChange={(event) => setReviewAction(event.target.value)}
                    options={[
                      { value: "approve", label: "Approve" },
                      { value: "reject", label: "Reject" },
                    ]}
                  />
                </div>

                {reviewAction === "approve" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-3)" }}>
                    <Input
                      type="date"
                      value={approvedDate}
                      min={todayDateInput()}
                      onChange={(event) => setApprovedDate(event.target.value)}
                    />
                    <Input
                      type="time"
                      value={approvedTime}
                      onChange={(event) => setApprovedTime(event.target.value)}
                    />
                  </div>
                )}

                <Textarea
                  rows={4}
                  placeholder={reviewAction === "reject" ? "Reason for rejection (required)" : "Optional remarks"}
                  value={reviewDescription}
                  onChange={(event) => setReviewDescription(event.target.value)}
                />

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant={reviewAction === "approve" ? "success" : "danger"} loading={reviewSubmitting} onClick={handleReviewSubmit}>
                    {reviewAction === "approve" ? "Approve and Notify" : "Reject and Notify"}
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                <h4 style={sectionTitleStyle}>Review Summary</h4>
                <div style={{ color: "var(--color-text-body)" }}>
                  <strong>Action:</strong> {selectedAppointment.review?.action || "-"}
                </div>
                <div style={{ color: "var(--color-text-body)" }}>
                  <strong>Reviewed At:</strong> {formatDateTime(selectedAppointment.review?.reviewedAt)}
                </div>
                <div style={{ color: "var(--color-text-body)" }}>
                  <strong>Reviewed By:</strong> {selectedAppointment.review?.reviewedBy?.name || "-"}
                </div>
                {selectedAppointment.approvedMeeting?.date ? (
                  <div style={{ color: "var(--color-text-body)" }}>
                    <strong>Approved Meeting:</strong> {formatDate(selectedAppointment.approvedMeeting.date)} | {selectedAppointment.approvedMeeting.time}
                  </div>
                ) : null}
                <div style={{ color: "var(--color-text-body)", whiteSpace: "pre-wrap" }}>
                  <strong>Remarks:</strong> {selectedAppointment.review?.description || "-"}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default JRAppointmentsPage
