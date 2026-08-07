import { useEffect, useRef, useState } from "react"
import Papa from "papaparse"
import { StatusBadge } from "czero/react"
import { Button, Input } from "hzero"
import { AlertTriangle, FileDown, FileUp, RefreshCw, Trash2, UserPlus, Users } from "lucide-react"
import { Alert, FileInput, Field, Grid, HStack, Label, Modal, Surface, Text, VStack } from "@/components/ui"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { adminApi } from "@/service"
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

  // Single add
  const [addRoll, setAddRoll] = useState("")
  const [addCaterer, setAddCaterer] = useState("")
  const [addForce, setAddForce] = useState(false)

  // Bulk
  const [bulkCaterer, setBulkCaterer] = useState("")
  const [bulkForce, setBulkForce] = useState(false)
  const [bulkRolls, setBulkRolls] = useState([])
  const [bulkFileName, setBulkFileName] = useState("")
  const [bulkError, setBulkError] = useState("")
  const [bulkResult, setBulkResult] = useState(null)
  const fileInputRef = useRef(null)

  const caterers = data?.caterers || []

  const fetchData = async () => {
    if (!periodId) return
    setLoading(true)
    try {
      const response = await adminApi.getDiningPeriodAllocations(periodId)
      setData(response)
      // Default the caterer selects to the first caterer once, if unset.
      if (response?.caterers?.length) {
        setAddCaterer((prev) => prev || response.caterers[0].catererId)
        setBulkCaterer((prev) => prev || response.caterers[0].catererId)
      }
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
    setBulkResult(null)
    setBulkRolls([])
    setBulkFileName("")
    setBulkError("")
    setData(null)
    setAddRoll("")
    setAddCaterer("")
    setBulkCaterer("")
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

  const handleAdd = () => {
    const rollNumber = addRoll.trim().toUpperCase()
    if (!rollNumber) return setFeedback({ type: "error", message: "Enter a roll number." })
    if (!addCaterer) return setFeedback({ type: "error", message: "Select a caterer." })
    runAction(async () => {
      const res = await adminApi.assignDiningAllocation(periodId, { rollNumber, catererId: addCaterer, force: addForce })
      setAddRoll("")
      return res?.message || `Assigned ${rollNumber}`
    })
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

  const parseCsv = (file) => {
    setBulkError("")
    setBulkResult(null)
    setBulkFileName(file.name)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || []
        if (!headers.includes("rollNumber")) return setBulkError("Missing required column: rollNumber")
        if (results.data.length > MAX_BULK_RECORDS) return setBulkError(BULK_RECORD_LIMIT_MESSAGE)
        const rolls = [
          ...new Set(results.data.map((row) => String(row.rollNumber || "").trim().toUpperCase()).filter(Boolean)),
        ]
        if (rolls.length === 0) return setBulkError("No roll numbers found in the CSV.")
        setBulkRolls(rolls)
      },
      error: (error) => setBulkError(`Error parsing CSV: ${error.message}`),
    })
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.type && file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
      return setBulkError("Please upload a valid CSV file.")
    }
    parseCsv(file)
  }

  const downloadTemplate = () => {
    const blob = new Blob(["rollNumber\n"], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "caterer_students_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleBulk = () => {
    if (!bulkCaterer) return setFeedback({ type: "error", message: "Select a caterer for the upload." })
    if (bulkRolls.length === 0) return setBulkError("Upload a CSV with roll numbers first.")
    runAction(
      async () => {
        const res = await adminApi.bulkAssignDiningAllocations(periodId, {
          catererId: bulkCaterer,
          rollNumbers: bulkRolls,
          force: bulkForce,
        })
        setBulkResult(res?.data || null)
        setBulkRolls([])
        setBulkFileName("")
        if (fileInputRef.current) fileInputRef.current.value = ""
        return res?.message || "Bulk assignment complete"
      },
      { keepFeedback: false }
    )
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
        {activeTab === "add" && (
          <VStack gap="large">
            {/* Single student */}
            <Surface bg="var(--color-bg-secondary)" padding={4} radius="lg" border="1px solid var(--color-border-primary)">
              <Label>Add a single student</Label>
              <Grid min={200} gap={3} style={{ marginTop: "var(--spacing-2)" }}>
                <Field label="Roll Number" htmlFor="add-roll">
                  <Input id="add-roll" value={addRoll} placeholder="e.g. B21CS001"
                    onChange={(e) => setAddRoll(e.target.value)} />
                </Field>
                <Field label="Caterer" htmlFor="add-caterer">
                  <select id="add-caterer" style={{ ...selectStyle, maxWidth: "none", width: "100%" }}
                    value={addCaterer} onChange={(e) => setAddCaterer(e.target.value)}>
                    <CatererOptions caterers={caterers} />
                  </select>
                </Field>
              </Grid>
              <HStack justify="between" align="center" style={{ marginTop: "var(--spacing-3)" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-2)", cursor: "pointer" }}>
                  <input type="checkbox" checked={addForce} onChange={(e) => setAddForce(e.target.checked)} />
                  <Text as="span" color="muted" size="sm">Force past caterer capacity</Text>
                </label>
                <Button variant="primary" size="sm" onClick={handleAdd} loading={busy} disabled={busy}>
                  <UserPlus size={16} /> Assign
                </Button>
              </HStack>
            </Surface>

            {/* Bulk upload */}
            <Surface bg="var(--color-bg-secondary)" padding={4} radius="lg" border="1px solid var(--color-border-primary)">
              <Label>Bulk assign to one caterer (roll-number CSV)</Label>
              <Grid min={200} gap={3} style={{ marginTop: "var(--spacing-2)" }}>
                <Field label="Caterer" htmlFor="bulk-caterer">
                  <select id="bulk-caterer" style={{ ...selectStyle, maxWidth: "none", width: "100%" }}
                    value={bulkCaterer} onChange={(e) => setBulkCaterer(e.target.value)}>
                    <CatererOptions caterers={caterers} />
                  </select>
                </Field>
              </Grid>

              <Surface
                bg="var(--color-bg-hover)"
                padding={5}
                radius="xl"
                border="2px dashed var(--color-border-input)"
                align="center"
                style={{ cursor: "pointer", marginTop: "var(--spacing-3)" }}
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click() }}
              >
                <FileUp size={26} style={{ margin: "0 auto var(--spacing-2)", color: "var(--color-text-muted)" }} />
                <Text color="muted" size="sm">Upload CSV with a <strong>rollNumber</strong> column</Text>
                {bulkFileName && (
                  <Text color="brand" size="sm" style={{ marginTop: "var(--spacing-1)" }}>Selected: {bulkFileName}</Text>
                )}
                <FileInput ref={fileInputRef} accept=".csv" onChange={handleFileChange} hidden />
              </Surface>

              <HStack justify="between" align="center" gap={2} style={{ marginTop: "var(--spacing-3)" }}>
                <Button type="button" variant="secondary" size="sm" onClick={downloadTemplate}>
                  <FileDown size={16} /> Template
                </Button>
                <Text as="span" color="muted" size="sm">
                  {bulkRolls.length} roll number{bulkRolls.length === 1 ? "" : "s"} loaded
                </Text>
              </HStack>

              {bulkError && <Alert type="error" icon style={{ marginTop: "var(--spacing-2)" }}>{bulkError}</Alert>}

              <HStack justify="between" align="center" style={{ marginTop: "var(--spacing-3)" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-2)", cursor: "pointer" }}>
                  <input type="checkbox" checked={bulkForce} onChange={(e) => setBulkForce(e.target.checked)} />
                  <Text as="span" color="muted" size="sm">Force past caterer capacity</Text>
                </label>
                <Button variant="primary" size="sm" onClick={handleBulk} loading={busy} disabled={busy || bulkRolls.length === 0}>
                  <UserPlus size={16} /> Assign {bulkRolls.length || ""}
                </Button>
              </HStack>

              {bulkResult && (
                <Surface bg="var(--color-bg-primary)" padding={3} radius="md" border="1px solid var(--color-border-primary)" style={{ marginTop: "var(--spacing-3)" }}>
                  <Text as="span" color="secondary" size="sm" weight="medium" style={{ display: "block" }}>
                    {bulkResult.summary.assigned} assigned · {bulkResult.summary.moved} moved ·{" "}
                    {bulkResult.summary.unchanged} unchanged · {bulkResult.summary.failed} failed
                  </Text>
                  {bulkResult.failures?.length > 0 && (
                    <VStack gap="small" style={{ marginTop: "var(--spacing-2)" }}>
                      {bulkResult.failures.slice(0, 12).map((failure) => (
                        <HStack key={failure.rollNumber} gap={2} align="center">
                          <AlertTriangle size={13} style={{ color: "var(--color-warning)", flexShrink: 0 }} />
                          <Text as="span" color="muted" size="xs">
                            <strong>{failure.rollNumber}</strong> — {failure.reason}
                          </Text>
                        </HStack>
                      ))}
                      {bulkResult.failures.length > 12 && (
                        <Text as="span" color="muted" size="xs">…and {bulkResult.failures.length - 12} more</Text>
                      )}
                    </VStack>
                  )}
                </Surface>
              )}
            </Surface>
          </VStack>
        )}
      </VStack>
    </Modal>
  )
}

export default ManageAllocationsModal
