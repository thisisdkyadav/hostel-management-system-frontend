import { useEffect, useMemo, useState } from "react"
import { Tabs, Button, DataTable, Modal, Input } from "czero/react"
import { Eye, Search, CalendarDays, Clock3, CheckCircle2, XCircle } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import PageFooter from "../../components/common/PageFooter"
import { Badge, Pagination, Select, Textarea, useToast, StatCards } from "@/components/ui"
import { appointmentsApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"

const APPOINTMENT_SUBROLES = ["Joint Registrar SA", "Associate Dean SA", "Dean SA"]
const APPOINTMENT_STATUS_TAB_CONFIG = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
]

const labelStyle = {
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 2,
  display: "block",
}

const sectionStyle = {
  padding: "var(--spacing-3)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-secondary)",
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

const AppointmentsPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  const isAppointmentAdmin =
    user?.role === "Admin" && APPOINTMENT_SUBROLES.includes(user?.subRole)

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchValue, setSearchValue] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  })
  const [statusCountsLoading, setStatusCountsLoading] = useState(false)

  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [acceptingAppointments, setAcceptingAppointments] = useState(false)

  const [selectedId, setSelectedId] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const [reviewAction, setReviewAction] = useState("approve")
  const [reviewDescription, setReviewDescription] = useState("")
  const [approvedDate, setApprovedDate] = useState("")
  const [approvedTime, setApprovedTime] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await appointmentsApi.getAdminAppointments({
        page,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchValue || undefined,
      })
      setAppointments(response.items || [])
      setTotalPages(response.pagination?.totalPages || 1)
      setTotalCount(response.pagination?.total || 0)
    } catch (error) {
      toast.error(error.message || "Failed to fetch appointments")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      setAvailabilityLoading(true)
      const response = await appointmentsApi.getMyAvailability()
      setAcceptingAppointments(Boolean(response.availability?.acceptingAppointments))
    } catch (error) {
      toast.error(error.message || "Failed to fetch availability")
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const fetchStatusCounts = async () => {
    try {
      setStatusCountsLoading(true)
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        appointmentsApi.getAdminAppointments({ page: 1, limit: 1 }),
        appointmentsApi.getAdminAppointments({ page: 1, limit: 1, status: "Pending" }),
        appointmentsApi.getAdminAppointments({ page: 1, limit: 1, status: "Approved" }),
        appointmentsApi.getAdminAppointments({ page: 1, limit: 1, status: "Rejected" }),
      ])

      const extractTotal = (response) => response?.pagination?.total || response?.items?.length || 0
      setStatusCounts({
        all: extractTotal(allRes),
        Pending: extractTotal(pendingRes),
        Approved: extractTotal(approvedRes),
        Rejected: extractTotal(rejectedRes),
      })
    } catch {
      // Keep count failures silent; main table data handles user-facing errors.
    } finally {
      setStatusCountsLoading(false)
    }
  }

  const fetchAppointmentById = async (appointmentId) => {
    try {
      setDetailsLoading(true)
      const response = await appointmentsApi.getAdminAppointmentById(appointmentId)
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
    await Promise.all([fetchAppointments(), fetchStatusCounts()])
    if (selectedId) {
      await fetchAppointmentById(selectedId)
    }
  }

  useEffect(() => {
    if (!isAppointmentAdmin) return
    fetchAvailability()
    fetchStatusCounts()
  }, [isAppointmentAdmin])

  useEffect(() => {
    if (!isAppointmentAdmin) return
    const delay = setTimeout(() => {
      fetchAppointments()
    }, 350)
    return () => clearTimeout(delay)
  }, [isAppointmentAdmin, page, statusFilter, searchValue])

  const handleToggleAvailability = async () => {
    const nextValue = !acceptingAppointments

    try {
      setAvailabilityLoading(true)
      const response = await appointmentsApi.updateMyAvailability(nextValue)
      setAcceptingAppointments(Boolean(response.availability?.acceptingAppointments))
      toast.success(response.message || "Availability updated")
    } catch (error) {
      toast.error(error.message || "Failed to update availability")
    } finally {
      setAvailabilityLoading(false)
    }
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
      const response = await appointmentsApi.reviewAppointment(selectedAppointment.id, {
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
  const appointmentStatusTabs = useMemo(
    () =>
      APPOINTMENT_STATUS_TAB_CONFIG.map((tab) => ({
        ...tab,
        count: statusCounts[tab.value] || 0,
      })),
    [statusCounts]
  )
  const appointmentStats = useMemo(
    () => [
      {
        title: "Total Requests",
        value: statusCounts.all,
        subtitle: "All appointments",
        icon: <CalendarDays size={16} />,
        color: "var(--color-primary)",
      },
      {
        title: "Pending",
        value: statusCounts.Pending,
        subtitle: "Awaiting review",
        icon: <Clock3 size={16} />,
        color: "var(--color-warning)",
        tintBackground: true,
      },
      {
        title: "Approved",
        value: statusCounts.Approved,
        subtitle: "Meeting scheduled",
        icon: <CheckCircle2 size={16} />,
        color: "var(--color-success)",
        tintBackground: true,
      },
      {
        title: "Rejected",
        value: statusCounts.Rejected,
        subtitle: "Closed as rejected",
        icon: <XCircle size={16} />,
        color: "var(--color-danger)",
        tintBackground: true,
      },
    ],
    [statusCounts]
  )

  if (!isAppointmentAdmin) {
    return (
      <div className="flex-1">
        <PageHeader title="Appointments" subtitle="Access denied" />
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PageHeader
        title="Appointments"
        subtitle={`Requests assigned to ${user?.name || ""} (${user?.subRole || "Admin"})`}
      >
        <Button
          variant={acceptingAppointments ? "success" : "outline"}
          size="md"
          loading={availabilityLoading}
          onClick={handleToggleAvailability}
        >
          {acceptingAppointments ? "Accepting: ON" : "Accepting: OFF"}
        </Button>
      </PageHeader>

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-6) var(--spacing-8)" }}>
        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <StatCards
            stats={appointmentStats}
            columns={4}
            loading={statusCountsLoading}
            loadingCount={4}
          />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Tabs
              variant="pills"
              tabs={appointmentStatusTabs}
              activeTab={statusFilter}
              setActiveTab={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
            />
          </div>

          <div className="w-full lg:w-[420px] lg:max-w-[420px]">
            <Input
              type="text"
              icon={<Search size={16} />}
              placeholder="Search name, mobile, email, or ID..."
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "var(--spacing-4)" }}>
          <DataTable
            columns={columns}
            data={appointments}
            loading={loading}
            emptyMessage="No appointment requests found"
            onRowClick={handleOpenDetails}
          />
        </div>
      </div>

      <PageFooter
        leftContent={[
          <span key="count" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Showing{" "}
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
              {loading ? 0 : appointments.length}
            </span>{" "}
            of{" "}
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
              {loading ? 0 : totalCount}
            </span>{" "}
            appointments
          </span>,
        ]}
        rightContent={[
          <Pagination
            key="pagination"
            currentPage={page}
            totalPages={totalPages}
            paginate={setPage}
            compact
            showPageInfo={false}
          />,
        ]}
      />

      <Modal
        title={selectedAppointment ? `Appointment — #${selectedAppointment.id?.slice(-6).toUpperCase()}` : "Appointment"}
        onClose={handleCloseDetails}
        width={620}
        isOpen={detailsOpen}
        footer={
          selectedAppointment?.status === "Pending" ? (
            <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
              <Button size="sm" variant="secondary" onClick={handleCloseDetails}>Cancel</Button>
              <Button
                size="sm"
                variant={reviewAction === "approve" ? "success" : "danger"}
                loading={reviewSubmitting}
                onClick={handleReviewSubmit}
              >
                {reviewAction === "approve" ? "Approve & Notify" : "Reject & Notify"}
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={handleCloseDetails}>Close</Button>
          )
        }
      >
        {detailsLoading ? (
          <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Loading...</div>
        ) : !selectedAppointment ? (
          <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Details unavailable</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>

            {/* Visitor header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-2)" }}>
              <div>
                <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)", color: "var(--color-text-heading)" }}>
                  {selectedAppointment.visitorName}
                </div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>
                  {selectedAppointment.email} · {selectedAppointment.mobileNumber}
                </div>
              </div>
              <Badge variant={statusVariant(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
            </div>

            {/* Info grid */}
            <div style={{ ...sectionStyle, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-3)" }}>
              <div>
                <span style={labelStyle}>With</span>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                  {selectedAppointment.targetOfficial?.name || "-"}
                </div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  {selectedAppointment.targetSubRole || "-"}
                </div>
              </div>
              <div>
                <span style={labelStyle}>Identity</span>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                  {selectedAppointment.idType}: {selectedAppointment.idNumber}
                </div>
              </div>
              <div>
                <span style={labelStyle}>Preferred</span>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                  {formatDate(selectedAppointment.preferredDate)}
                </div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  {selectedAppointment.preferredTime}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div style={sectionStyle}>
              <span style={labelStyle}>Reason for Meeting</span>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {selectedAppointment.reason}
              </div>
            </div>

            {selectedAppointment.status === "Pending" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                <div style={{ height: 1, backgroundColor: "var(--color-border-primary)" }} />
                <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Review</span>
                <div style={{ display: "grid", gridTemplateColumns: reviewAction === "approve" ? "160px 1fr 1fr" : "160px 1fr", gap: "var(--spacing-2)", alignItems: "end" }}>
                  <div>
                    <span style={labelStyle}>Action</span>
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
                    <>
                      <div>
                        <span style={labelStyle}>Meeting Date</span>
                        <Input type="date" value={approvedDate} min={todayDateInput()} onChange={(event) => setApprovedDate(event.target.value)} />
                      </div>
                      <div>
                        <span style={labelStyle}>Meeting Time</span>
                        <Input type="time" value={approvedTime} onChange={(event) => setApprovedTime(event.target.value)} />
                      </div>
                    </>
                  )}
                </div>
                <Textarea
                  rows={2}
                  placeholder={reviewAction === "reject" ? "Reason for rejection (required)" : "Optional remarks"}
                  value={reviewDescription}
                  onChange={(event) => setReviewDescription(event.target.value)}
                />
              </div>
            ) : (
              <div style={{ ...sectionStyle, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-3)" }}>
                <div>
                  <span style={labelStyle}>Action</span>
                  <Badge variant={statusVariant(selectedAppointment.review?.action === "approve" ? "Approved" : "Rejected")}>
                    {selectedAppointment.review?.action || "-"}
                  </Badge>
                </div>
                {selectedAppointment.approvedMeeting?.date && (
                  <div>
                    <span style={labelStyle}>Approved Meeting</span>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                      {formatDate(selectedAppointment.approvedMeeting.date)} · {selectedAppointment.approvedMeeting.time}
                    </div>
                  </div>
                )}
                <div>
                  <span style={labelStyle}>Reviewed By</span>
                  <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                    {selectedAppointment.review?.reviewedBy?.name || "-"}
                  </div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    {formatDateTime(selectedAppointment.review?.reviewedAt)}
                  </div>
                </div>
                {selectedAppointment.review?.description && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={labelStyle}>Remarks</span>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)", whiteSpace: "pre-wrap" }}>
                      {selectedAppointment.review.description}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AppointmentsPage
