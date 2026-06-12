import { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal, StatusBadge, Table, Tabs } from "czero/react"
import { CheckCircle2, Clock, RefreshCw, Search, UtensilsCrossed, Users } from "lucide-react"
import { Alert, Card, EmptyState, HStack, Label, StatCards, VStack } from "@/components/ui"
import PageHeader from "../../components/common/PageHeader"
import { catererApi } from "../../service"
import { useSocket } from "../../contexts/SocketProvider"
import CapacityBar from "@/components/dining/CapacityBar"

const STATUS_LABELS = {
  verified: "Verified",
  duplicate: "Duplicate",
  "wrong-caterer": "Wrong Caterer",
  "not-allocated": "Not Allocated",
  "unknown-student": "Unknown Student",
  "outside-meal-time": "Outside Meal Time",
  "no-active-period": "No Active Period",
  "on-rebate": "On Rebate",
}

const STATUS_TONES = {
  verified: "success",
  duplicate: "warning",
  "wrong-caterer": "danger",
  "not-allocated": "danger",
  "unknown-student": "danger",
  "outside-meal-time": "warning",
  "no-active-period": "warning",
  "on-rebate": "warning",
}

const formatDateTime = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

const formatTime = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" })
}

const formatPeriodRange = (period) => {
  if (!period) return "No active dining period"
  return `${formatDate(period.startDate)} – ${formatDate(period.endDate)}`
}

const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback

const LiveIndicator = ({ connected }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1-5)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: connected ? "var(--color-success)" : "var(--color-text-muted)" }}>
    <span
      className={connected ? "animate-pulse" : ""}
      style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", backgroundColor: connected ? "var(--color-success)" : "var(--color-text-placeholder)" }}
    />
    {connected ? "Live" : "Offline"}
  </span>
)

const StudentListModal = ({ isOpen, onClose, students = [], loading = false, mealSlot = null }) => {
  if (!isOpen) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Students for Current Meal" width={880}>
      <VStack gap="medium">
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          {mealSlot ? `${mealSlot.name} · ${mealSlot.startTime}–${mealSlot.endTime}` : "No meal slot is active right now."}
        </p>
        {!loading && students.length === 0 ? (
          <Alert type="info" icon>No students are allocated to this caterer for the active period yet.</Alert>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-primary)]">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Student</Table.Head>
                  <Table.Head>Roll Number</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Last Scan</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {students.map((entry) => (
                  <Table.Row key={entry.allocationId || entry.rollNumber}>
                    <Table.Cell>
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>{entry.student?.name || "Student"}</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{entry.student?.email || "-"}</div>
                    </Table.Cell>
                    <Table.Cell>{entry.rollNumber}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={entry.isVerified ? "Verified" : "Pending"} tone={entry.isVerified ? "success" : "warning"} />
                    </Table.Cell>
                    <Table.Cell>{formatDateTime(entry.latestVerification?.scannedAt)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </VStack>
    </Modal>
  )
}

const MealVerificationPage = () => {
  const { socket, isConnected } = useSocket()
  const [context, setContext] = useState({ caterer: null, currentPeriod: null })
  const [studentState, setStudentState] = useState({ students: [], total: 0, verifiedCount: 0, pendingCount: 0, rebateCount: 0, currentMealSlot: null })
  const [rebateSummary, setRebateSummary] = useState({ days: [], currentRebateCount: 0, upcomingRebateCount: 0 })
  const [entries, setEntries] = useState([])
  const [feedFilter, setFeedFilter] = useState("all")
  const [rollNumber, setRollNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const currentMealSlot = studentState.currentMealSlot || context.currentPeriod?.currentMealSlot || null
  const currentMealLabel = currentMealSlot ? `${currentMealSlot.name}` : "No active meal slot"
  const currentMealTime = currentMealSlot ? `${currentMealSlot.startTime} – ${currentMealSlot.endTime}` : "Verification opens during meal hours"

  const stats = useMemo(
    () => [
      { title: "Allocated", value: studentState.total || 0, subtitle: "Students this meal", icon: <Users size={20} />, color: "var(--color-primary)" },
      { title: "Verified", value: studentState.verifiedCount || 0, subtitle: "Meals confirmed", icon: <CheckCircle2 size={20} />, color: "var(--color-success)" },
      { title: "Pending", value: studentState.pendingCount || 0, subtitle: "Not yet scanned", icon: <Clock size={20} />, color: "var(--color-warning)" },
      { title: "On Rebate", value: studentState.rebateCount || rebateSummary.currentRebateCount || 0, subtitle: "Excused today", icon: <UtensilsCrossed size={20} />, color: "var(--color-text-muted)" },
    ],
    [studentState, rebateSummary]
  )

  const issuesCount = useMemo(() => entries.filter((entry) => entry.status !== "verified").length, [entries])
  const visibleEntries = useMemo(
    () => (feedFilter === "issues" ? entries.filter((entry) => entry.status !== "verified") : entries),
    [entries, feedFilter]
  )

  const fetchContext = async () => {
    const response = await catererApi.getMealVerificationContext()
    setContext(response || { caterer: null, currentPeriod: null })
  }

  const fetchFeed = async () => {
    const response = await catererApi.getMealVerificationFeed({ limit: 50 })
    setEntries(Array.isArray(response?.entries) ? response.entries : [])
  }

  const fetchStudents = async () => {
    setStudentsLoading(true)
    try {
      const response = await catererApi.getCurrentMealStudents()
      setStudentState({
        students: Array.isArray(response?.students) ? response.students : [],
        total: Number(response?.total || 0),
        verifiedCount: Number(response?.verifiedCount || 0),
        pendingCount: Number(response?.pendingCount || 0),
        rebateCount: Number(response?.rebateCount || 0),
        currentMealSlot: response?.currentMealSlot || null,
      })
    } catch (studentError) {
      setError(getErrorMessage(studentError, "Unable to load current meal students."))
    } finally {
      setStudentsLoading(false)
    }
  }

  const fetchRebateSummary = async () => {
    const response = await catererApi.getRebateSummary()
    setRebateSummary({
      days: Array.isArray(response?.days) ? response.days : [],
      currentRebateCount: Number(response?.currentRebateCount || 0),
      upcomingRebateCount: Number(response?.upcomingRebateCount || 0),
    })
  }

  const refreshAll = async () => {
    setLoading(true)
    setError("")
    try {
      await Promise.all([fetchContext(), fetchFeed(), fetchStudents(), fetchRebateSummary()])
    } catch (refreshError) {
      setError(getErrorMessage(refreshError, "Unable to load current meal verification details."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
  }, [])

  useEffect(() => {
    if (!socket) return undefined
    const handleNewVerification = (payload) => {
      const verification = payload?.verification
      if (!verification) return
      setEntries((prev) => {
        if (prev.some((entry) => entry.id === verification.id)) return prev
        return [verification, ...prev].slice(0, 50)
      })
      fetchStudents().catch(() => {})
      fetchRebateSummary().catch(() => {})
    }
    socket.on("dining-meal-verification:new", handleNewVerification)
    return () => socket.off("dining-meal-verification:new", handleNewVerification)
  }, [socket])

  const handleManualVerify = async (event) => {
    event.preventDefault()
    if (!rollNumber.trim()) {
      setError("Please enter a roll number.")
      return
    }
    setManualLoading(true)
    setError("")
    setSuccessMessage("")
    try {
      const response = await catererApi.manualMealVerification({ rollNumber: rollNumber.trim() })
      const verification = response?.verification
      if (verification) {
        setEntries((prev) => [verification, ...prev.filter((entry) => entry.id !== verification.id)].slice(0, 50))
      }
      await fetchStudents()
      await fetchRebateSummary()
      setSuccessMessage(response?.verification?.message || "Manual meal verification recorded.")
      setRollNumber("")
    } catch (manualError) {
      setError(getErrorMessage(manualError, "Unable to verify meal manually."))
    } finally {
      setManualLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Meal Verification">
        <HStack gap="small">
          <Button variant="secondary" onClick={() => setShowStudentsModal(true)}>
            <Users size={18} /> View Students
          </Button>
          <Button variant="secondary" onClick={refreshAll} disabled={loading}>
            <RefreshCw size={18} /> {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </HStack>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
        <VStack gap="large">
          {error && <Alert type="error" icon dismissible onDismiss={() => setError("")}>{error}</Alert>}
          {successMessage && <Alert type="success" icon dismissible onDismiss={() => setSuccessMessage("")}>{successMessage}</Alert>}

          {/* Current meal hero */}
          <Card>
            <div className="flex flex-col lg:flex-row lg:items-center gap-[var(--spacing-5)]">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                  <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-primary-bg)", color: "var(--color-primary)", flexShrink: 0 }}>
                    <UtensilsCrossed size={24} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                      <h2 style={{ margin: 0, fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>{currentMealLabel}</h2>
                      <LiveIndicator connected={isConnected} />
                    </div>
                    <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{currentMealTime}</p>
                    <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                      {context.caterer?.name || "Caterer"} · {formatPeriodRange(context.currentPeriod)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[280px] lg:flex-shrink-0">
                <CapacityBar allocated={studentState.verifiedCount} total={studentState.total} label="Verified this meal" />
                <p style={{ margin: "var(--spacing-2) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                  {studentState.verifiedCount} verified · {studentState.pendingCount} pending
                </p>
              </div>
            </div>
          </Card>

          {/* Manual verify */}
          <Card>
            <form onSubmit={handleManualVerify}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-[var(--spacing-3)] items-end">
                <div>
                  <Label htmlFor="manual-roll" required>Manual Verification</Label>
                  <Input id="manual-roll" value={rollNumber} onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    placeholder="Enter roll number, e.g. 22BCS001" required />
                </div>
                <Button type="submit" variant="primary" loading={manualLoading} disabled={manualLoading}>
                  <Search size={18} /> Verify Meal
                </Button>
              </div>
            </form>
          </Card>

          {/* Stats */}
          <StatCards columns={4} stats={stats} />

          {/* 3-day availability */}
          {rebateSummary.days.length > 0 && (
            <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Availability Forecast</h3>
                <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Today and the next two days, after approved rebates are excluded.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--spacing-3)]">
                {rebateSummary.days.map((day) => (
                  <div key={day.date} className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-[var(--spacing-4)]">
                    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{formatDate(day.date)}</p>
                    <p style={{ color: "var(--color-text-heading)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-2xl)" }}>{day.availableStudentCount || 0}</p>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                      of {day.allocatedStudentCount || 0} allocated · {day.approvedRebateCount || 0} on rebate
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Live feed */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Live Verification Feed</h3>
                <LiveIndicator connected={isConnected} />
              </div>
              <Tabs
                variant="pills"
                size="sm"
                tabs={[
                  { value: "all", label: "All", count: entries.length || undefined },
                  { value: "issues", label: "Issues", count: issuesCount || undefined },
                ]}
                activeTab={feedFilter}
                setActiveTab={setFeedFilter}
              />
            </div>

            {visibleEntries.length === 0 ? (
              <EmptyState
                icon={Search}
                title={feedFilter === "issues" ? "No Issues" : "No Scans Yet"}
                message={feedFilter === "issues" ? "Failed or flagged scans will appear here." : "Face scanner and manual verification attempts will appear here in real time."}
              />
            ) : (
              <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-primary)]">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Time</Table.Head>
                      <Table.Head>Student</Table.Head>
                      <Table.Head>Meal</Table.Head>
                      <Table.Head>Status</Table.Head>
                      <Table.Head>Source</Table.Head>
                      <Table.Head>Message</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {visibleEntries.map((entry) => (
                      <Table.Row key={entry.id}>
                        <Table.Cell>
                          <HStack gap="small" align="center">
                            <Clock size={14} style={{ color: "var(--color-text-muted)" }} />
                            {formatTime(entry.scannedAt)}
                          </HStack>
                        </Table.Cell>
                        <Table.Cell>
                          <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>{entry.student?.name || "Unknown Student"}</div>
                          <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{entry.rollNumber}</div>
                        </Table.Cell>
                        <Table.Cell>{entry.mealSlotName || "-"}</Table.Cell>
                        <Table.Cell>
                          <StatusBadge status={STATUS_LABELS[entry.status] || entry.status} tone={STATUS_TONES[entry.status] || "primary"} />
                        </Table.Cell>
                        <Table.Cell>{entry.source === "manual" ? "Manual" : "Face Scanner"}</Table.Cell>
                        <Table.Cell>{entry.message || "-"}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </Card>
        </VStack>
      </div>

      <StudentListModal
        isOpen={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        students={studentState.students}
        loading={studentsLoading}
        mealSlot={currentMealSlot}
      />
    </div>
  )
}

export default MealVerificationPage
