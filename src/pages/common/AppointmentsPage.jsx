import { useEffect, useMemo, useState } from "react"
import { Button, DataTable, Modal } from "czero/react"
import { Eye, Search } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import PageFooter from "../../components/common/PageFooter"
import { Badge, Input, Pagination, Select, Tabs, Textarea, useToast } from "@/components/ui"
import { appointmentsApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"

const APPOINTMENT_SUBROLES = ["Joint Registrar SA", "Associate Dean SA", "Dean SA"]
const APPOINTMENT_STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
]

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
    await fetchAppointments()
    if (selectedId) {
      await fetchAppointmentById(selectedId)
    }
  }

  useEffect(() => {
    if (!isAppointmentAdmin) return
    fetchAvailability()
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Tabs
              tabs={APPOINTMENT_STATUS_TABS}
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
        title={selectedAppointment ? `Appointment #${selectedAppointment.id?.slice(-6)}` : "Appointment"}
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
            <div
              style={{
                ...cardStyle,
                padding: "var(--spacing-3)",
                display: "flex",
                justifyContent: "space-between",
                gap: "var(--spacing-2)",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {selectedAppointment.visitorName}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  {selectedAppointment.email}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  {selectedAppointment.mobileNumber}
                </div>
              </div>
              <Badge variant={statusVariant(selectedAppointment.status)}>
                {selectedAppointment.status}
              </Badge>
            </div>

            <div
              style={{
                ...cardStyle,
                padding: "var(--spacing-3)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "var(--spacing-3)",
              }}
            >
              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Appointment With
                </div>
                <div style={{ color: "var(--color-text-body)" }}>
                  {selectedAppointment.targetOfficial?.name || "-"} ({selectedAppointment.targetSubRole || "-"})
                </div>
              </div>
              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Identity
                </div>
                <div style={{ color: "var(--color-text-body)" }}>
                  {selectedAppointment.idType}: {selectedAppointment.idNumber}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Preferred Meeting
                </div>
                <div style={{ color: "var(--color-text-body)" }}>
                  {formatDate(selectedAppointment.preferredDate)} | {selectedAppointment.preferredTime}
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: "var(--spacing-3)" }}>
              <div
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "var(--font-size-sm)",
                  marginBottom: "var(--spacing-1)",
                }}
              >
                Reason for Meeting
              </div>
              <div style={{ color: "var(--color-text-body)", whiteSpace: "pre-wrap" }}>
                {selectedAppointment.reason}
              </div>
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
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "var(--spacing-3)",
                    }}
                  >
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
                  <Button
                    variant={reviewAction === "approve" ? "success" : "danger"}
                    loading={reviewSubmitting}
                    onClick={handleReviewSubmit}
                  >
                    {reviewAction === "approve" ? "Approve and Notify" : "Reject and Notify"}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  ...cardStyle,
                  padding: "var(--spacing-3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-2)",
                }}
              >
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

export default AppointmentsPage
