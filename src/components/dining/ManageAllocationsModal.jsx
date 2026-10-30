import { useEffect, useState } from "react"
import { Alert, Button, HStack, Modal, StatusBadge, Surface, Text, VStack } from "hzero"
import { RefreshCw, Trash2, UserPlus, Users } from "lucide-react"
import { adminApi } from "@/service"
import AllocationAddPanel from "./AllocationAddPanel"
import { getErrorMessage } from "./diningPeriodHelpers"

const TABS = [
  { id: "lists", name: "Caterer Lists", icon: <Users size={14} /> },
  { id: "add", name: "Add / Bulk", icon: <UserPlus size={14} /> },
]

const selectStyle = {
  height: "32px",
  padding: "0 var(--spacing-2)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-input)",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-secondary)",
  fontSize: "var(--font-size-sm)",
  maxWidth: "180px",
}

const CatererOptions = ({ caterers }) =>
  caterers.map((caterer) => (
    <option key={caterer.catererId} value={caterer.catererId}>
      {caterer.name} ({caterer.actualCount}/{caterer.maxStudentCount})
    </option>
  ))

/**
 * Admin management of the caterer-wise student lists for one dining period.
 * All writes go through the backend allocation owner (atomic + capacity-guarded);
 * this modal just drives assign / move / remove / bulk-CSV / reconcile and
 * re-reads the live counts after each change.
 */
const ManageAllocationsModal = ({ isOpen, period, onClose, onChanged }) => {
  const periodId = period?.id
  const [activeTab, setActiveTab] = useState("lists")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)

  const caterers = data?.caterers || []

  const fetchData = async () => {
    if (!periodId) return
    setLoading(true)
    try {
      const response = await adminApi.getDiningPeriodAllocations(periodId)
      setData(response)
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Unable to load allocations.") })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    setActiveTab("lists")
    setFeedback(null)
    setData(null)
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, periodId])

  const runAction = async (fn, { keepFeedback = false } = {}) => {
    setBusy(true)
    if (!keepFeedback) setFeedback(null)
    try {
      const message = await fn()
      await fetchData()
      onChanged?.()
      if (message) setFeedback({ type: "success", message })
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error, "Action failed.") })
    } finally {
      setBusy(false)
    }
  }

  const handleMove = (rollNumber, catererId) => {
    runAction(async () => {
      const res = await adminApi.assignDiningAllocation(periodId, { rollNumber, catererId, force: false })
      return res?.message || `Moved ${rollNumber}`
    })
  }

  const handleRemove = (studentUserId, rollNumber) => {
    runAction(async () => {
      await adminApi.removeDiningAllocation(periodId, studentUserId)
      return `Removed ${rollNumber}`
    })
  }

  const handleReconcile = () => {
    runAction(async () => {
      const res = await adminApi.reconcileDiningAllocations(periodId)
      return res?.message || "Seat counts reconciled"
    })
  }

  const seatCaterers = caterers.map((caterer) => ({
    id: caterer.catererId,
    name: caterer.name,
    allocated: caterer.actualCount,
    capacity: caterer.maxStudentCount,
  }))

  const handleAdded = async () => {
    await fetchData()
    onChanged?.()
  }

  if (!isOpen || !period) return null

  const footer = (
    <HStack justify="between" style={{ width: "100%" }}>
      <Text as="span" color="muted" size="sm">
        {data ? `${data.totalAssigned} assigned · ${data.totalCapacity} total seats` : ""}
      </Text>
      <Button variant="secondary" onClick={onClose}>Close</Button>
    </HStack>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Students"
      width={820}
      minHeight="60vh"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      footer={footer}
    >
      <VStack gap="large">
        {feedback && (
          <Alert type={feedback.type} icon dismissible onDismiss={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        {data?.hasDrift && (
          <Alert type="warning" icon>
            <HStack justify="between" align="center" gap={3} style={{ width: "100%" }}>
              <span>Some seat counters don’t match the actual lists. Reconcile to fix them.</span>
              <Button variant="secondary" size="sm" onClick={handleReconcile} disabled={busy}>
                <RefreshCw size={14} /> Reconcile
              </Button>
            </HStack>
          </Alert>
        )}

        {/* ===================== LISTS ===================== */}
        {activeTab === "lists" && (
          <VStack gap="large">
            {loading && <Text color="muted">Loading…</Text>}
            {!loading && caterers.length === 0 && <Text color="muted">No caterers configured for this period.</Text>}
            {!loading &&
              caterers.map((caterer) => (
                <Surface
                  key={caterer.catererId}
                  bg="var(--color-bg-primary)"
                  padding={4}
                  radius="lg"
                  border="1px solid var(--color-border-primary)"
                >
                  <HStack justify="between" align="center" style={{ marginBottom: "var(--spacing-3)" }}>
                    <HStack gap={2} align="center">
                      <Text as="span" weight="semibold" color="secondary">{caterer.name}</Text>
                      <StatusBadge
                        status={`${caterer.actualCount}/${caterer.maxStudentCount}`}
                        tone={caterer.isFull ? "danger" : "success"}
                        showDot={false}
                      />
                      {caterer.countDrift && (
                        <StatusBadge status="drift" tone="warning" showDot={false} />
                      )}
                    </HStack>
                    <Text as="span" color="muted" size="sm">
                      {caterer.remainingSeats} seat{caterer.remainingSeats === 1 ? "" : "s"} left
                    </Text>
                  </HStack>

                  {caterer.students.length === 0 ? (
                    <Text color="muted" size="sm">No students assigned.</Text>
                  ) : (
                    <VStack gap="small">
                      {caterer.students.map((student) => (
                        <HStack
                          key={student.studentUserId}
                          justify="between"
                          align="center"
                          gap={3}
                          style={{
                            padding: "var(--spacing-2) var(--spacing-3)",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "var(--color-bg-secondary)",
                          }}
                        >
                          <span style={{ minWidth: 0 }}>
                            <Text as="span" weight="medium" color="secondary" style={{ display: "block" }}>
                              {student.rollNumber}
                              {student.name ? ` · ${student.name}` : ""}
                            </Text>
                            {(student.department || student.batch) && (
                              <Text as="span" color="muted" size="xs" style={{ display: "block" }}>
                                {[student.department, student.batch].filter(Boolean).join(" · ")}
                              </Text>
                            )}
                          </span>
                          <HStack gap={2} align="center">
                            <select
                              style={selectStyle}
                              value={caterer.catererId}
                              disabled={busy}
                              title="Move to another caterer"
                              onChange={(event) => {
                                if (event.target.value !== caterer.catererId) {
                                  handleMove(student.rollNumber, event.target.value)
                                }
                              }}
                            >
                              <CatererOptions caterers={caterers} />
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy}
                              title="Remove from period"
                              onClick={() => handleRemove(student.studentUserId, student.rollNumber)}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Surface>
              ))}
          </VStack>
        )}

        {/* ===================== ADD / BULK ===================== */}
        {/* Stays mounted so a half-filled form survives a trip to the other tab. */}
        <div hidden={activeTab !== "add"}>
          <AllocationAddPanel periodId={periodId} caterers={seatCaterers} onChanged={handleAdded} />
        </div>
      </VStack>
    </Modal>
  )
}

export default ManageAllocationsModal
