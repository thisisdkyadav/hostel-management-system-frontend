import { useEffect, useMemo, useState } from "react"
import { StatusBadge, Table, Tabs, Button, Input } from "hzero"
import { Field, Grid, Heading, Modal, Page, Text } from "@/components/ui"
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
        <Text color="muted" size="sm">
          {mealSlot ? `${mealSlot.name} · ${mealSlot.startTime}–${mealSlot.endTime}` : "No meal slot is active right now."}
        </Text>
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
                      <Text as="div" weight="semibold" color="secondary">{entry.student?.name || "Student"}</Text>
                      <Text as="div" color="muted" size="sm">{entry.student?.email || "-"}</Text>
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
    <Page>
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

      <Page.Body>
        <VStack gap="large">
          {error && <Alert type="error" icon dismissible onDismiss={() => setError("")}>{error}</Alert>}
          {successMessage && <Alert type="success" icon dismissible onDismiss={() => setSuccessMessage("")}>{successMessage}</Alert>}

          {/* Current meal hero */}
          <Card>
            <div className="flex flex-col lg:flex-row lg:items-center gap-[var(--spacing-5)]">
              <div style={{ flex: 1, minWidth: 0 }}>
                <HStack gap={3} align="center">
                  <Text as="div" color="brand" style={{ width: 48, height: 48, borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-primary-bg)", flexShrink: 0 }} className="flex items-center justify-center">
                    <UtensilsCrossed size={24} />
                  </Text>
                  <div style={{ minWidth: 0 }}>
                    <HStack gap={2} align="center">
                      <Heading as="h2" size="xl" weight="bold" color="heading" style={{ margin: 0 }}>{currentMealLabel}</Heading>
                      <LiveIndicator connected={isConnected} />
                    </HStack>
                    <Text color="muted" size="sm" style={{ margin: "var(--spacing-1) 0 0" }}>{currentMealTime}</Text>
                    <Text color="muted" size="xs" style={{ margin: "var(--spacing-1) 0 0" }}>
                      {context.caterer?.name || "Caterer"} · {formatPeriodRange(context.currentPeriod)}
                    </Text>
                  </div>
                </HStack>
              </div>
              <div className="w-full lg:w-[280px] lg:flex-shrink-0">
                <CapacityBar allocated={studentState.verifiedCount} total={studentState.total} label="Verified this meal" />
                <Text color="muted" size="xs" style={{ margin: "var(--spacing-2) 0 0" }}>
                  {studentState.verifiedCount} verified · {studentState.pendingCount} pending
                </Text>
              </div>
            </div>
          </Card>

          {/* Manual verify */}
          <Card>
            <form onSubmit={handleManualVerify}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-[var(--spacing-3)] items-end">
                <Field label="Manual Verification" htmlFor="manual-roll" required>
                  <Input id="manual-roll" value={rollNumber} onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    placeholder="Enter roll number, e.g. 22BCS001" required />
                </Field>
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
                <Heading as="h3" size="md" weight="bold" color="heading" style={{ margin: 0 }}>Availability Forecast</Heading>
                <Text color="muted" size="sm" style={{ margin: "var(--spacing-1) 0 0" }}>
                  Today and the next two days, after approved rebates are excluded.
                </Text>
              </div>
              <Grid cols={{ base: 1, sm: 3 }} gap={3}>
                {rebateSummary.days.map((day) => (
                  <div key={day.date} className="rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-[var(--spacing-4)]">
                    <Text color="muted" size="sm">{formatDate(day.date)}</Text>
                    <Text color="heading" weight="bold" size="2xl">{day.availableStudentCount || 0}</Text>
                    <Text color="muted" size="xs">
                      of {day.allocatedStudentCount || 0} allocated · {day.approvedRebateCount || 0} on rebate
                    </Text>
                  </div>
                ))}
              </Grid>
            </Card>
          )}

          {/* Live feed */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <HStack gap={3} align="center" justify="between" wrap>
              <HStack gap={2} align="center">
                <Heading as="h3" size="md" weight="bold" color="heading" style={{ margin: 0 }}>Live Verification Feed</Heading>
                <LiveIndicator connected={isConnected} />
              </HStack>
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
            </HStack>

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
                          <Text as="div" weight="semibold" color="secondary">{entry.student?.name || "Unknown Student"}</Text>
                          <Text as="div" color="muted" size="sm">{entry.rollNumber}</Text>
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
      </Page.Body>

      <StudentListModal
        isOpen={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        students={studentState.students}
        loading={studentsLoading}
        mealSlot={currentMealSlot}
      />
    </Page>
  )
}

export default MealVerificationPage
