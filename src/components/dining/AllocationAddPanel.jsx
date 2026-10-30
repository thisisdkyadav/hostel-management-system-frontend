import { useRef, useState } from "react"
import Papa from "papaparse"
import { useQueryClient } from "@tanstack/react-query"
import { Alert, Button, Checkbox, Field, FileInput, Grid, HStack, Input, Label, Select, Surface, Text, VStack } from "hzero"
import { AlertTriangle, FileDown, FileUp, UserPlus } from "lucide-react"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { queryKeys } from "@/lib/query"
import { adminApi } from "@/service"
import { getErrorMessage } from "./diningPeriodHelpers"

const catererOptions = (caterers) =>
  caterers.map((caterer) => ({ value: caterer.id, label: `${caterer.name} (${caterer.allocated}/${caterer.capacity})` }))

// The backend words a full caterer as "... enable force ..."; that is the cue to offer a retry.
const mentionsForce = (message) => /force/i.test(message || "")

/**
 * Add one student by roll number, or a roll-number CSV, to a caterer of one dining period.
 * Shared by the Manage Students modal (Dining Periods) and the Allocations page. It owns its
 * form state and talks to the allocation owner through adminApi; `onChanged(message)` fires
 * after every successful write so the host can refresh its own data.
 *
 * `caterers`: [{ id, name, allocated, capacity }] - the kitchens seated in the period.
 * `mode`: "both" (default), "single" or "bulk" - which form(s) to show.
 */
const AllocationAddPanel = ({ periodId, caterers, defaultCatererId = "", mode = "both", onChanged }) => {
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)
  // Set when a write was refused for capacity: shows a "retry with force" action for that write.
  const [forceRetry, setForceRetry] = useState(null)

  // Single add
  const [addRoll, setAddRoll] = useState("")
  const [pickedAdd, setPickedAdd] = useState(defaultCatererId)
  const [addForce, setAddForce] = useState(false)

  // Bulk
  const [pickedBulk, setPickedBulk] = useState(defaultCatererId)
  const [bulkForce, setBulkForce] = useState(false)
  const [bulkRolls, setBulkRolls] = useState([])
  const [bulkFileName, setBulkFileName] = useState("")
  const [bulkError, setBulkError] = useState("")
  const [bulkResult, setBulkResult] = useState(null)
  const fileInputRef = useRef(null)

  // Until a kitchen is picked, the first one is used.
  const known = (id) => caterers.some((caterer) => caterer.id === id)
  const addCaterer = known(pickedAdd) ? pickedAdd : caterers[0]?.id || ""
  const bulkCaterer = known(pickedBulk) ? pickedBulk : caterers[0]?.id || ""
  const options = catererOptions(caterers)

  const submitAdd = async (force = addForce) => {
    const rollNumber = addRoll.trim().toUpperCase()
    if (!rollNumber) return setFeedback({ type: "error", message: "Enter a roll number." })
    if (!addCaterer) return setFeedback({ type: "error", message: "Select a caterer." })
    setBusy(true)
    setFeedback(null)
    setForceRetry(null)
    try {
      const res = await adminApi.assignDiningAllocation(periodId, { rollNumber, catererId: addCaterer, force })
      setAddRoll("")
      const message = res?.message || `Assigned ${rollNumber}`
      setFeedback({ type: "success", message })
      queryClient.invalidateQueries({ queryKey: queryKeys.diningAllocations.all })
      await onChanged?.(message)
    } catch (error) {
      const message = getErrorMessage(error, "Action failed.")
      setFeedback({ type: "error", message })
      if (mentionsForce(message) && !force) setForceRetry("add")
    } finally {
      setBusy(false)
    }
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

  const submitBulk = async (force = bulkForce) => {
    if (!bulkCaterer) return setFeedback({ type: "error", message: "Select a caterer for the upload." })
    if (bulkRolls.length === 0) return setBulkError("Upload a CSV with roll numbers first.")
    setBusy(true)
    setFeedback(null)
    setForceRetry(null)
    try {
      const res = await adminApi.bulkAssignDiningAllocations(periodId, {
        catererId: bulkCaterer,
        rollNumbers: bulkRolls,
        force,
      })
      setBulkResult(res?.data || null)
      setBulkRolls([])
      setBulkFileName("")
      if (fileInputRef.current) fileInputRef.current.value = ""
      const message = res?.message || "Bulk assignment complete"
      setFeedback({ type: "success", message })
      queryClient.invalidateQueries({ queryKey: queryKeys.diningAllocations.all })
      await onChanged?.(message)
    } catch (error) {
      const message = getErrorMessage(error, "Action failed.")
      setFeedback({ type: "error", message })
      if (mentionsForce(message) && !force) setForceRetry("bulk")
    } finally {
      setBusy(false)
    }
  }

  const retryWithForce = () => {
    if (forceRetry === "add") {
      setAddForce(true)
      submitAdd(true)
    } else if (forceRetry === "bulk") {
      setBulkForce(true)
      submitBulk(true)
    }
  }

  return (
    <VStack gap="large">
      {feedback && (
        <Alert type={feedback.type} icon dismissible onDismiss={() => { setFeedback(null); setForceRetry(null) }}>
          <HStack justify="between" align="center" gap={3} wrap style={{ width: "100%" }}>
            <span>{feedback.message}</span>
            {forceRetry && (
              <Button variant="secondary" size="sm" onClick={retryWithForce} disabled={busy}>
                Retry with force
              </Button>
            )}
          </HStack>
        </Alert>
      )}

      {/* Single student */}
      {mode !== "bulk" && (
        <Surface bg="var(--color-bg-secondary)" padding={4} radius="lg" border="1px solid var(--color-border-primary)">
          <Label>Add a single student</Label>
          <Grid min={200} gap={3} style={{ marginTop: "var(--spacing-2)" }}>
            <Field label="Roll Number" htmlFor="add-roll">
              <Input id="add-roll" value={addRoll} placeholder="e.g. B21CS001" onChange={(e) => setAddRoll(e.target.value)} />
            </Field>
            <Field label="Caterer" htmlFor="add-caterer">
              <Select id="add-caterer" value={addCaterer} options={options} onChange={(e) => setPickedAdd(e.target.value)} />
            </Field>
          </Grid>
          <HStack justify="between" align="center" gap={3} wrap style={{ marginTop: "var(--spacing-3)" }}>
            <Checkbox
              size="small"
              checked={addForce}
              onChange={(e) => setAddForce(e.target.checked)}
              label="Force past caterer capacity"
            />
            <Button variant="primary" size="sm" onClick={() => submitAdd()} loading={busy} disabled={busy}>
              <UserPlus size={16} /> Assign
            </Button>
          </HStack>
        </Surface>
      )}

      {/* Bulk upload */}
      {mode !== "single" && (
        <Surface bg="var(--color-bg-secondary)" padding={4} radius="lg" border="1px solid var(--color-border-primary)">
          <Label>Bulk assign to one caterer (roll-number CSV)</Label>
          <Grid min={200} gap={3} style={{ marginTop: "var(--spacing-2)" }}>
            <Field label="Caterer" htmlFor="bulk-caterer">
              <Select id="bulk-caterer" value={bulkCaterer} options={options} onChange={(e) => setPickedBulk(e.target.value)} />
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

          <HStack justify="between" align="center" gap={3} wrap style={{ marginTop: "var(--spacing-3)" }}>
            <Checkbox
              size="small"
              checked={bulkForce}
              onChange={(e) => setBulkForce(e.target.checked)}
              label="Force past caterer capacity"
            />
            <Button variant="primary" size="sm" onClick={() => submitBulk()} loading={busy} disabled={busy || bulkRolls.length === 0}>
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
      )}
    </VStack>
  )
}

export default AllocationAddPanel
