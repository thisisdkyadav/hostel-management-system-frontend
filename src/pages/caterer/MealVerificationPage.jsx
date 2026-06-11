import { useEffect, useMemo, useState } from "react"
import { Button, Input, Modal, Table } from "czero/react"
import { Alert, Badge, Card, CardBody, CardHeader, HStack, Label, VStack } from "@/components/ui"
import PageHeader from "../../components/common/PageHeader"
import { catererApi } from "../../service"
import { useSocket } from "../../contexts/SocketProvider"
import { CheckCircle2, Clock, RefreshCw, Search, UtensilsCrossed, Users, XCircle } from "lucide-react"

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
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatPeriodRange = (period) => {
  if (!period) return "No active dining period"
  return `${formatDateTime(period.startDate)} to ${formatDateTime(period.endDate)}`
}

const formatDate = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback

const StudentListModal = ({ isOpen, onClose, students = [], loading = false, mealSlot = null }) => {
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Students Available for Current Meal" width={920} minHeight="65vh">
      <VStack gap="medium">
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          {mealSlot ? `${mealSlot.name} (${mealSlot.startTime}-${mealSlot.endTime})` : "No meal slot is active right now."}
        </p>
        <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border-light)]">
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
                    <div style={{ fontWeight: "var(--font-weight-semibold)" }}>{entry.student?.name || "Student"}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{entry.student?.email || "-"}</div>
                  </Table.Cell>
                  <Table.Cell>{entry.rollNumber}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={entry.isVerified ? "success" : "warning"}>
                      {entry.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{formatDateTime(entry.latestVerification?.scannedAt)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
        {!loading && students.length === 0 && (
          <Alert type="info" icon>
            No students are allocated to this caterer for the active period yet.
          </Alert>
        )}
      </VStack>
    </Modal>
  )
}

const MealVerificationPage = () => {
  const { socket, isConnected } = useSocket()
  const [context, setContext] = useState({ caterer: null, currentPeriod: null })
  const [studentState, setStudentState] = useState({ students: [], total: 0, verifiedCount: 0, pendingCount: 0, currentMealSlot: null })
  const [rebateSummary, setRebateSummary] = useState({ days: [], currentRebateCount: 0, upcomingRebateCount: 0 })
  const [entries, setEntries] = useState([])
  const [rollNumber, setRollNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const currentMealSlot = studentState.currentMealSlot || context.currentPeriod?.currentMealSlot || null
  const currentMealLabel = currentMealSlot
    ? `${currentMealSlot.name} · ${currentMealSlot.startTime}-${currentMealSlot.endTime}`
    : "No active meal slot"

  const stats = useMemo(() => [
    { label: "Allocated Students", value: studentState.total || 0 },
    { label: "Verified", value: studentState.verifiedCount || 0 },
    { label: "Pending", value: studentState.pendingCount || 0 },
    { label: "On Rebate Today", value: studentState.rebateCount || rebateSummary.currentRebateCount || 0 },
  ], [studentState, rebateSummary])

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
      <PageHeader title="Current Meal Verification">
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
          {error && <Alert type="error" icon>{error}</Alert>}
          {successMessage && <Alert type="success" icon>{successMessage}</Alert>}

          <Card>
            <CardBody>
              <form onSubmit={handleManualVerify}>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-[var(--spacing-3)] items-end">
                  <div>
                    <Label htmlFor="manual-roll" required>Manual Roll Number</Label>
                    <Input
                      id="manual-roll"
                      value={rollNumber}
                      onChange={(event) => setRollNumber(event.target.value.toUpperCase())}
                      placeholder="Enter roll number, e.g. 22BCS001"
                      required
                    />
                  </div>
                  <Button type="submit" variant="primary" loading={manualLoading} disabled={manualLoading}>
                    <Search size={18} /> Verify Meal
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-4)]">
            <Card>
              <CardHeader>
                <HStack gap="medium" align="center">
                  <UtensilsCrossed size={22} style={{ color: "var(--color-primary)" }} />
                  <div>
                    <h3 style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>{context.caterer?.name || "Caterer"}</h3>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{formatPeriodRange(context.currentPeriod)}</p>
                  </div>
                </HStack>
              </CardHeader>
              <CardBody>
                <Badge variant={currentMealSlot ? "success" : "warning"}>{currentMealLabel}</Badge>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <HStack gap="medium" align="center">
                  {isConnected ? <CheckCircle2 size={22} style={{ color: "var(--color-success)" }} /> : <XCircle size={22} style={{ color: "var(--color-danger)" }} />}
                  <div>
                    <h3 style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Scanner Feed</h3>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                      {isConnected ? "Live scanner updates connected" : "Socket offline"}
                    </p>
                  </div>
                </HStack>
              </CardHeader>
              <CardBody>
                <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Face scanner and manual attempts appear below instantly.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Current Meal Count</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-[var(--spacing-2)]">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] p-[var(--spacing-3)]">
                      <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>{item.label}</p>
                      <p style={{ color: "var(--color-text-heading)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-xl)" }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <HStack gap="medium" align="center">
                <Users size={22} style={{ color: "var(--color-primary)" }} />
                <div>
                  <h3 style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)" }}>Rebates & Available Students</h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    Today and the next two days, after approved rebates are excluded.
                  </p>
                </div>
              </HStack>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-3)]">
                {(rebateSummary.days || []).map((day) => (
                  <div key={day.date} className="rounded-[var(--radius-xl)] border border-[var(--color-border-light)] p-[var(--spacing-4)]">
                    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{formatDate(day.date)}</p>
                    <p style={{ color: "var(--color-text-heading)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-2xl)" }}>
                      {day.availableStudentCount || 0}
                    </p>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                      available of {day.allocatedStudentCount || 0}; {day.approvedRebateCount || 0} on rebate
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]">
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
                {entries.map((entry) => (
                  <Table.Row key={entry.id}>
                    <Table.Cell>
                      <HStack gap="small" align="center">
                        <Clock size={16} />
                        {formatDateTime(entry.scannedAt)}
                      </HStack>
                    </Table.Cell>
                    <Table.Cell>
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>
                        {entry.student?.name || "Unknown Student"}
                      </div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                        {entry.rollNumber}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{entry.mealSlotName || "-"}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={STATUS_TONES[entry.status] || "secondary"}>
                        {STATUS_LABELS[entry.status] || entry.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{entry.source === "manual" ? "Manual" : "Face Scanner"}</Table.Cell>
                    <Table.Cell>{entry.message || "-"}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {entries.length === 0 && (
            <Alert type="info" icon>
              No scans found yet. Face scanner and manual verification attempts will appear here.
            </Alert>
          )}
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
