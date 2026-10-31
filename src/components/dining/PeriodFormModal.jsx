import { useEffect, useRef, useState } from "react"
import Papa from "papaparse"
import { Alert, Button, ConfirmDialog, Field, FileInput, Grid, HStack, Input, Label, Modal, Surface, Text, ToggleButtonGroup, VStack } from "hzero"
import {
  Archive,
  ArchiveRestore,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  FileDown,
  FileUp,
  Plus,
  Sparkles,
  Tags,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"
import {
  DEFAULT_MEAL_SLOTS,
  ELIGIBILITY_MODE_ALL_ACTIVE,
  ELIGIBILITY_MODE_ALL_HOSTELLERS,
  ELIGIBILITY_MODE_CUSTOM,
  autoAllocationResultText,
  isAutoAllocationRearmable,
  buildCapacityRows,
  getAutoAllocationState,
  getErrorMessage,
  getIdValue,
  toDateInputValue,
  toDateTimeInputValue,
} from "./diningPeriodHelpers"
import MealPlannerModal from "./meal-planner/MealPlannerModal"
import { summarizePlan } from "./meal-planner/mealPlanner"

const FORM_TABS = [
  { id: "schedule", name: "Schedule", icon: <CalendarClock size={14} /> },
  { id: "caterers", name: "Caterers", icon: <Users size={14} /> },
  { id: "meals", name: "Meal Slots", icon: <UtensilsCrossed size={14} /> },
  { id: "eligibility", name: "Eligibility", icon: <Users size={14} /> },
  { id: "tags", name: "Allocation tags", icon: <Tags size={14} /> },
]

const DEFAULT_ANSWER_OPTIONS = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
]

let tagRowSeq = 0
/** A form row for an allocation tag. `defaultValue` stays null until the admin picks Yes / No. */
const makeTagRow = (tag = {}) => ({
  key: tag.id ? `tag-${tag.id}` : `new-tag-${(tagRowSeq += 1)}`,
  id: tag.id || "",
  name: tag.name || "",
  question: tag.question || "",
  defaultValue: typeof tag.defaultValue === "boolean" ? tag.defaultValue : null,
})

const initialFormState = {
  startDate: "",
  endDate: "",
  registrationEnabled: true,
  allocationStartAt: "",
  allocationEndAt: "",
  notificationAt: "",
  autoAllocationAt: "",
  catererIds: [],
  catererCapacities: [],
  mealSlots: DEFAULT_MEAL_SLOTS,
  weekSchedule: [],
  dateSchedule: [],
  dailyRate: "",
  eligibilityMode: ELIGIBILITY_MODE_ALL_HOSTELLERS,
  eligibleRollNumbers: [],
  tags: [],
}

const RollNumberCsvInput = ({ rollNumbers, onChange }) => {
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const downloadTemplate = () => {
    const blob = new Blob(["rollNumber\n"], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "dining_period_students_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const parseCsv = (file) => {
    setError("")
    setFileName(file.name)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || []
        if (!headers.includes("rollNumber")) {
          setError("Missing required field: rollNumber")
          return
        }
        if (results.data.length > MAX_BULK_RECORDS) {
          setError(BULK_RECORD_LIMIT_MESSAGE)
          return
        }
        const parsedRollNumbers = [
          ...new Set(
            results.data.map((row) => String(row.rollNumber || "").trim().toUpperCase()).filter(Boolean)
          ),
        ]
        if (parsedRollNumbers.length === 0) {
          setError("No roll numbers found in the CSV.")
          return
        }
        onChange(parsedRollNumbers)
      },
      error: (parseError) => setError(`Error parsing CSV: ${parseError.message}`),
    })
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.type && file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a valid CSV file.")
      return
    }
    parseCsv(file)
  }

  return (
    <VStack gap="small">
      <Surface bg="var(--color-bg-hover)" padding={5} radius="xl" border="2px dashed var(--color-border-input)" align="center" style={{ cursor: "pointer" }} role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click()
        }}>
        <FileUp size={28} style={{ margin: "0 auto var(--spacing-2)", color: "var(--color-text-muted)" }} />
        <Text color="muted" size="sm">
          Upload CSV with a <strong>rollNumber</strong> column
        </Text>
        {fileName && (
          <Text color="brand" size="sm" style={{ marginTop: "var(--spacing-2)" }}>
            Selected: {fileName}
          </Text>
        )}
        <FileInput ref={fileInputRef} accept=".csv" onChange={handleFileChange} hidden />
      </Surface>

      <HStack justify="between" gap="small">
        <Button type="button" variant="secondary" size="sm" onClick={downloadTemplate}>
          <FileDown size={16} /> Download Template
        </Button>
        <Text as="span" color="muted" size="sm">
          {rollNumbers.length} roll number{rollNumbers.length === 1 ? "" : "s"} loaded
        </Text>
      </HStack>

      {error && <Alert type="error" icon>{error}</Alert>}
    </VStack>
  )
}

const sectionTile = {
  display: "grid",
  gridTemplateColumns: "minmax(140px, 1fr) minmax(110px, 140px) minmax(110px, 140px) auto",
  gap: "var(--spacing-3)",
  alignItems: "end",
  padding: "var(--spacing-3)",
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-lg)",
  backgroundColor: "var(--color-bg-secondary)",
}

const tagTile = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  gap: "var(--spacing-3)",
  alignItems: "start",
  padding: "var(--spacing-3)",
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-lg)",
  backgroundColor: "var(--color-bg-secondary)",
}

/**
 * Create / edit a dining period. Sections are split across header tabs;
 * validation failures jump to the offending tab so nothing hides off-screen.
 */
const PeriodFormModal = ({
  isOpen,
  title,
  submitLabel,
  mode = "create",
  initialData = initialFormState,
  caterers,
  onClose,
  onSubmit,
  archiveAction = null,
}) => {
  const isEdit = mode === "edit"
  const [formData, setFormData] = useState(initialFormState)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("schedule")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [tagToRemove, setTagToRemove] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const selectedCatererIds = Array.isArray(initialData.catererIds)
      ? initialData.catererIds.map(getIdValue).filter(Boolean)
      : []

    setFormData({
      startDate: toDateInputValue(initialData.startDate),
      endDate: toDateInputValue(initialData.endDate),
      registrationEnabled: initialData.registrationEnabled !== false,
      allocationStartAt: toDateTimeInputValue(initialData.allocationStartAt),
      allocationEndAt: toDateTimeInputValue(initialData.allocationEndAt),
      notificationAt: toDateTimeInputValue(initialData.notificationAt),
      autoAllocationAt: toDateTimeInputValue(initialData.autoAllocationAt),
      catererIds: selectedCatererIds,
      catererCapacities: buildCapacityRows(selectedCatererIds, initialData.catererCapacities),
      mealSlots:
        Array.isArray(initialData.mealSlots) && initialData.mealSlots.length > 0
          ? initialData.mealSlots.map((slot) => ({
              name: slot.name || "",
              startTime: slot.startTime || "",
              endTime: slot.endTime || "",
            }))
          : DEFAULT_MEAL_SLOTS,
      weekSchedule: Array.isArray(initialData.weekSchedule) ? initialData.weekSchedule : [],
      dateSchedule: Array.isArray(initialData.dateSchedule) ? initialData.dateSchedule : [],
      dailyRate: initialData.dailyRate != null && initialData.dailyRate !== "" ? String(initialData.dailyRate) : "",
      eligibilityMode: initialData.eligibilityMode || ELIGIBILITY_MODE_ALL_ACTIVE,
      eligibleRollNumbers: Array.isArray(initialData.eligibleRollNumbers) ? initialData.eligibleRollNumbers : [],
      tags: Array.isArray(initialData.tags) ? initialData.tags.map(makeTagRow) : [],
    })
    setError("")
    setActiveTab("schedule")
    setIsSubmitting(false)
  }, [initialData, isOpen])

  const handleCatererToggle = (catererId) => {
    setFormData((prev) => {
      const catererSet = new Set(prev.catererIds)
      let nextCapacities = Array.isArray(prev.catererCapacities) ? [...prev.catererCapacities] : []
      if (catererSet.has(catererId)) {
        const existingCapacity = nextCapacities.find((entry) => entry.catererId === catererId)
        if (Number(existingCapacity?.allocatedCount || 0) > 0) {
          setError("This caterer already has student allocations and cannot be removed.")
          return prev
        }
        catererSet.delete(catererId)
        nextCapacities = nextCapacities.filter((entry) => entry.catererId !== catererId)
      } else {
        catererSet.add(catererId)
        nextCapacities.push({ catererId, maxStudentCount: "1", allocatedCount: 0 })
      }
      return { ...prev, catererIds: [...catererSet], catererCapacities: nextCapacities }
    })
  }

  const handleCapacityChange = (catererId, value) => {
    const nextValue = String(value || "").replace(/[^\d]/g, "")
    setFormData((prev) => ({
      ...prev,
      catererCapacities: prev.catererCapacities.some((entry) => entry.catererId === catererId)
        ? prev.catererCapacities.map((entry) =>
            entry.catererId === catererId ? { ...entry, maxStudentCount: nextValue } : entry
          )
        : [...prev.catererCapacities, { catererId, maxStudentCount: nextValue, allocatedCount: 0 }],
    }))
  }

  const handleEligibilityModeChange = (mode) => {
    setFormData((prev) => ({
      ...prev,
      eligibilityMode: mode,
      eligibleRollNumbers: mode === ELIGIBILITY_MODE_CUSTOM ? prev.eligibleRollNumbers : [],
    }))
  }

  const handleMealSlotChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      mealSlots: prev.mealSlots.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot
      ),
    }))
  }

  const handleAddMealSlot = () => {
    setFormData((prev) => ({ ...prev, mealSlots: [...prev.mealSlots, { name: "", startTime: "", endTime: "" }] }))
  }

  const handleRemoveMealSlot = (index) => {
    setFormData((prev) => ({ ...prev, mealSlots: prev.mealSlots.filter((_, slotIndex) => slotIndex !== index) }))
  }

  const handleTagChange = (key, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.map((tag) => (tag.key === key ? { ...tag, [field]: value } : tag)),
    }))
  }

  const handleAddTag = () => {
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, makeTagRow()] }))
  }

  const handleMoveTag = (index, direction) => {
    setFormData((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.tags.length) return prev
      const next = [...prev.tags]
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...prev, tags: next }
    })
  }

  const removeTag = (key) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag.key !== key) }))
  }

  // Saved tags keep their students' answers, so removing one asks first; unsaved rows just go.
  const handleRemoveTag = (tag) => {
    if (tag.id) setTagToRemove(tag)
    else removeTag(tag.key)
  }

  const initialAutoAllocationAt = toDateTimeInputValue(initialData.autoAllocationAt)
  const autoAllocationRearmable = isAutoAllocationRearmable(initialData)
  const autoAllocationLocked = !autoAllocationRearmable && getAutoAllocationState(initialData) !== "none" &&
    getAutoAllocationState(initialData) !== "scheduled"
  const autoAllocationResult = autoAllocationResultText(initialData.autoAllocation)

  /** Returns { tab, message } for the first failure, or null when valid. */
  const validateForm = () => {
    const fail = (tab, message) => ({ tab, message })

    if (!formData.startDate || !formData.endDate) return fail("schedule", "Start date and end date are required.")
    if (new Date(formData.startDate) > new Date(formData.endDate))
      return fail("schedule", "Start date must be before or equal to end date.")
    if (formData.registrationEnabled) {
      if (!formData.allocationStartAt || !formData.allocationEndAt)
        return fail("schedule", "Allocation start and end time are required.")
      if (new Date(formData.allocationStartAt) > new Date(formData.allocationEndAt))
        return fail("schedule", "Allocation start time must be before or equal to allocation end time.")
      if (formData.notificationAt && new Date(formData.notificationAt) > new Date(formData.allocationEndAt))
        return fail("schedule", "Notification time must be before the allocation end time.")
    }

    // Scheduled auto-allocation. A locked (already run) time is never re-validated.
    if (formData.autoAllocationAt && !autoAllocationLocked) {
      const autoAt = new Date(formData.autoAllocationAt)
      if (Number.isNaN(autoAt.getTime())) return fail("schedule", "Auto-allocation time is not a valid date and time.")
      if (formData.registrationEnabled && autoAt <= new Date(formData.allocationEndAt))
        return fail("schedule", "Auto-allocation time must be after the allocation closes.")
      if (autoAt >= new Date(`${formData.startDate}T00:00`))
        return fail("schedule", "Auto-allocation time must be before the period's first day starts.")
      if (formData.autoAllocationAt !== initialAutoAllocationAt && autoAt <= new Date())
        return fail("schedule", "Auto-allocation time must be in the future.")
    }

    if (formData.catererIds.length === 0) return fail("caterers", "Please select at least one caterer.")
    if (formData.catererCapacities.some((entry) => Number(entry.maxStudentCount || 0) < 1))
      return fail("caterers", "Each selected caterer must have a max student count of at least 1.")

    if (formData.mealSlots.length === 0) return fail("meals", "Please add at least one meal verification slot.")
    if (formData.mealSlots.some((slot) => !slot.name.trim() || !slot.startTime || !slot.endTime))
      return fail("meals", "Each meal slot must have a name, start time, and end time.")

    if (formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM && formData.eligibleRollNumbers.length === 0)
      return fail("eligibility", "Please upload at least one roll number for custom eligibility.")

    const seenTagNames = new Set()
    for (const [index, tag] of formData.tags.entries()) {
      const name = tag.name.trim()
      if (!name) return fail("tags", `Tag ${index + 1} needs a name.`)
      if (name.length > 60) return fail("tags", `Tag “${name.slice(0, 20)}…” is too long (60 characters max).`)
      const lowered = name.toLowerCase()
      if (seenTagNames.has(lowered)) return fail("tags", `Tag name “${name}” is used more than once.`)
      seenTagNames.add(lowered)
      if (typeof tag.defaultValue !== "boolean")
        return fail("tags", `Choose a default answer (Yes or No) for “${name}”.`)
    }

    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validation = validateForm()
    if (validation) {
      setActiveTab(validation.tab)
      setError(validation.message)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationEnabled: formData.registrationEnabled,
        allocationStartAt: formData.registrationEnabled ? formData.allocationStartAt : "",
        allocationEndAt: formData.registrationEnabled ? formData.allocationEndAt : "",
        notificationAt: formData.registrationEnabled ? formData.notificationAt : "",
        // Unchanged value keeps the original ISO string; locked periods always resend it untouched.
        autoAllocationAt:
          autoAllocationLocked || formData.autoAllocationAt === initialAutoAllocationAt
            ? initialData.autoAllocationAt || ""
            : formData.autoAllocationAt
              ? new Date(formData.autoAllocationAt).toISOString()
              : "",
        catererIds: formData.catererIds,
        catererCapacities: formData.catererCapacities.map((entry) => ({
          ...entry,
          maxStudentCount: Number(entry.maxStudentCount || 0),
          allocatedCount: Number(entry.allocatedCount || 0),
        })),
        mealSlots: formData.mealSlots.map((slot) => ({
          name: slot.name.trim(),
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
        weekSchedule: formData.weekSchedule,
        dateSchedule: formData.dateSchedule,
        dailyRate: Number(formData.dailyRate || 0),
        eligibilityMode: formData.eligibilityMode,
        eligibleRollNumbers:
          formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM ? formData.eligibleRollNumbers : [],
        tags: formData.tags.map((tag) => ({
          ...(tag.id ? { id: tag.id } : {}),
          name: tag.name.trim(),
          question: tag.question.trim(),
          defaultValue: tag.defaultValue,
        })),
      })
      onClose()
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to save dining period. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const noCaterers = caterers.length === 0
  const currentTabIndex = FORM_TABS.findIndex((tab) => tab.id === activeTab)
  const isLastTab = currentTabIndex === FORM_TABS.length - 1

  // Create flow is a guided wizard: advance with Next, only allowing forward
  // movement once the current (and earlier) tabs validate. Edit flow keeps a
  // submit on every tab so any single change can be saved from where you are.
  const goToNextTab = () => {
    const validation = validateForm()
    if (validation) {
      const failingIndex = FORM_TABS.findIndex((tab) => tab.id === validation.tab)
      if (failingIndex !== -1 && failingIndex <= currentTabIndex) {
        setActiveTab(validation.tab)
        setError(validation.message)
        return
      }
    }
    setError("")
    setActiveTab(FORM_TABS[Math.min(currentTabIndex + 1, FORM_TABS.length - 1)].id)
  }

  const goToPrevTab = () => {
    setError("")
    setActiveTab(FORM_TABS[Math.max(currentTabIndex - 1, 0)].id)
  }

  const submitButton = (
    <Button type="submit" form="dining-period-form" variant="primary" loading={isSubmitting} disabled={isSubmitting || noCaterers}>
      {isSubmitting ? "Saving..." : submitLabel}
    </Button>
  )

  const footer = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", width: "100%" }}>
      <div>
        {archiveAction && (
          <Button type="button" variant="ghost" onClick={archiveAction.onClick}>
            {archiveAction.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            {archiveAction.label}
          </Button>
        )}
      </div>
      <HStack gap="small">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        {currentTabIndex > 0 && (
          <Button type="button" variant="secondary" onClick={goToPrevTab}>
            Back
          </Button>
        )}
        {isEdit || isLastTab ? (
          submitButton
        ) : (
          <Button type="button" variant="primary" onClick={goToNextTab} disabled={noCaterers}>
            Next
          </Button>
        )}
      </HStack>
    </div>
  )

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={840}
      minHeight="62vh"
      tabs={FORM_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      footer={footer}
    >
      <form id="dining-period-form" onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && <Alert type="error" icon>{error}</Alert>}

          {/* SCHEDULE */}
          {activeTab === "schedule" && (
            <VStack gap="large">
              <Alert type="info" icon>
                Rebate rules (short-term limits, advance notice) are no longer set per period. Manage them in Settings › Dining.
              </Alert>
              <Grid min={220} gap={4}>
                <Field label="Start Date" htmlFor="startDate" required>
                  <Input id="startDate" type="date" value={formData.startDate}
                    onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} required />
                </Field>
                <Field label="End Date" htmlFor="endDate" required>
                  <Input id="endDate" type="date" value={formData.endDate}
                    onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))} required />
                </Field>
              </Grid>
              <Surface bg="var(--color-bg-secondary)" padding={4} radius="lg" border="1px solid var(--color-border-primary)">
                <HStack justify="between" align="start" gap={3}>
                  <span style={{ flex: 1 }}>
                    <Label htmlFor="registrationEnabled" style={{ cursor: "pointer" }}>Student self-registration</Label>
                    <Text as="span" color="muted" size="sm" style={{ display: "block" }}>
                      When on, students pick their own caterer during a timed window. When off, you assign caterers
                      manually from “Manage Students”.
                    </Text>
                  </span>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-2)", whiteSpace: "nowrap", cursor: "pointer" }}>
                    <input
                      id="registrationEnabled"
                      type="checkbox"
                      checked={formData.registrationEnabled}
                      onChange={(e) => setFormData((p) => ({ ...p, registrationEnabled: e.target.checked }))}
                    />
                    <Text as="span" color="secondary" size="sm" weight="medium">
                      {formData.registrationEnabled ? "Enabled" : "Disabled"}
                    </Text>
                  </label>
                </HStack>
              </Surface>
              {formData.registrationEnabled ? (
                <Grid min={220} gap={4}>
                  <Field label="Allocation Opens" htmlFor="allocationStartAt" required>
                    <Input id="allocationStartAt" type="datetime-local" value={formData.allocationStartAt}
                      onChange={(e) => setFormData((p) => ({ ...p, allocationStartAt: e.target.value }))} required />
                  </Field>
                  <Field label="Allocation Closes" htmlFor="allocationEndAt" required>
                    <Input id="allocationEndAt" type="datetime-local" value={formData.allocationEndAt}
                      onChange={(e) => setFormData((p) => ({ ...p, allocationEndAt: e.target.value }))} required />
                  </Field>
                  <Field label="Notify Students At" htmlFor="notificationAt"
                    help="One group email goes to all eligible students at this time. Leave empty to skip.">
                    <Input id="notificationAt" type="datetime-local" value={formData.notificationAt}
                      onChange={(e) => setFormData((p) => ({ ...p, notificationAt: e.target.value }))} />
                  </Field>
                </Grid>
              ) : (
                <Alert type="warning" icon>
                  Self-registration is off. Students won’t see this period to pick a caterer — assign them yourself
                  from the “Manage Students” action on the period card (single, or bulk by roll-number CSV).
                </Alert>
              )}
              <Grid min={220} gap={4}>
                <Field
                  label="Auto-allocate Unassigned Students"
                  htmlFor="autoAllocationAt"
                  help={
                    autoAllocationLocked
                      ? autoAllocationResult
                      : autoAllocationRearmable
                        ? `${autoAllocationResult} Set a new time to run it again; students already placed are kept.`
                        : formData.registrationEnabled
                        ? "Students who haven’t picked a caterer by then are assigned one with free seats. Leave empty to skip."
                        : "Assign every eligible student automatically at this time. Leave empty to skip."
                  }
                >
                  <Input id="autoAllocationAt" type="datetime-local" value={formData.autoAllocationAt}
                    disabled={autoAllocationLocked}
                    onClear={autoAllocationLocked ? undefined : () => setFormData((p) => ({ ...p, autoAllocationAt: "" }))}
                    onChange={(e) => setFormData((p) => ({ ...p, autoAllocationAt: e.target.value }))} />
                </Field>
              </Grid>
              <Grid min={220} gap={4}>
                <Field label="Daily Rate (₹ / day)" htmlFor="dailyRate">
                  <Input id="dailyRate" type="number" min="0" step="0.01" placeholder="0"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData((p) => ({ ...p, dailyRate: e.target.value }))} />
                </Field>
              </Grid>
              <Alert type="info" icon>
                The period dates control when meals are verified. The daily rate is what each eligible student is
                billed per day in this period (skipping approved-rebate days) — used by mess fee periods.
              </Alert>
            </VStack>
          )}

          {/* CATERERS */}
          {activeTab === "caterers" && (
            <VStack gap="small">
              <Label required>Allowed Caterers & Capacity</Label>
              {noCaterers && (
                <Alert type="warning" icon>No active caterers found. Add a caterer before creating a period.</Alert>
              )}
              <Grid min={240} gap={2}>
                {caterers.map((caterer) => {
                  const capacity = formData.catererCapacities.find((entry) => entry.catererId === caterer.id)
                  const selected = formData.catererIds.includes(caterer.id)
                  return (
                    <div
                      key={caterer.id}
                      style={{
                        display: "flex",
                        gap: "var(--spacing-2)",
                        alignItems: "flex-start",
                        padding: "var(--spacing-3)",
                        border: `1px solid ${selected ? "var(--color-primary)" : "var(--color-border-primary)"}`,
                        borderRadius: "var(--radius-lg)",
                        backgroundColor: selected ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                      }}
                    >
                      <input type="checkbox" checked={selected} onChange={() => handleCatererToggle(caterer.id)} style={{ marginTop: 3 }} />
                      <span style={{ flex: 1 }}>
                        <Text as="span" color="secondary" weight="semibold" style={{ display: "block" }}>
                          {caterer.name}
                        </Text>
                        <Text as="span" color="muted" size="sm" style={{ display: "block" }}>
                          {caterer.email}
                        </Text>
                        {selected && (
                          <span style={{ display: "block", marginTop: "var(--spacing-2)" }}>
                            <Label htmlFor={`capacity-${caterer.id}`} required>Max Students</Label>
                            <Input
                              id={`capacity-${caterer.id}`}
                              type="number"
                              min="1"
                              value={capacity?.maxStudentCount ?? ""}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleCapacityChange(caterer.id, e.target.value)}
                            />
                            {Number(capacity?.allocatedCount || 0) > 0 && (
                              <Text as="span" color="muted" size="xs">
                                Already allocated: {capacity?.allocatedCount}
                              </Text>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </Grid>
            </VStack>
          )}

          {/* MEAL SLOTS */}
          {activeTab === "meals" && (
            <VStack gap="small">
              <HStack justify="between" align="center">
                <Label required>Meal Verification Slots</Label>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddMealSlot}>
                  <Plus size={16} /> Add Slot
                </Button>
              </HStack>
              <Grid cols={1} gap={3}>
                {formData.mealSlots.map((slot, index) => (
                  <div key={`${slot.name}-${index}`} style={sectionTile}>
                    <Field label="Name" htmlFor={`meal-slot-name-${index}`} required>
                      <Input id={`meal-slot-name-${index}`} value={slot.name} placeholder="Breakfast"
                        onChange={(e) => handleMealSlotChange(index, "name", e.target.value)} required />
                    </Field>
                    <Field label="Start" htmlFor={`meal-slot-start-${index}`} required>
                      <Input id={`meal-slot-start-${index}`} type="time" value={slot.startTime}
                        onChange={(e) => handleMealSlotChange(index, "startTime", e.target.value)} required />
                    </Field>
                    <Field label="End" htmlFor={`meal-slot-end-${index}`} required>
                      <Input id={`meal-slot-end-${index}`} type="time" value={slot.endTime}
                        onChange={(e) => handleMealSlotChange(index, "endTime", e.target.value)} required />
                    </Field>
                    <Button type="button" variant="secondary" size="md" title="Remove slot"
                      onClick={() => handleRemoveMealSlot(index)} disabled={formData.mealSlots.length <= 1}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </Grid>
              <Surface bg="var(--color-bg-secondary)" padding={4} radius="lg" border="1px solid var(--color-border-primary)">
                <HStack justify="between" align="center" gap={3} wrap>
                  <VStack gap={1}>
                    <Text weight="semibold">Day-by-day timings</Text>
                    <Text size="sm" color="secondary">
                      The slots above are the standard timings. Vary them by weekday or for specific dates.
                      {" "}<strong>{summarizePlan(formData)}</strong>
                    </Text>
                  </VStack>
                  <Button type="button" variant="primary" size="sm" onClick={() => setPlannerOpen(true)}>
                    <Sparkles size={16} /> Open meal planner
                  </Button>
                </HStack>
              </Surface>
            </VStack>
          )}

          {/* ELIGIBILITY */}
          {activeTab === "eligibility" && (
            <VStack gap="small">
              <Label required>Student Eligibility</Label>
              <HStack gap="small" style={{ flexWrap: "wrap" }}>
                <Button type="button" variant={formData.eligibilityMode === ELIGIBILITY_MODE_ALL_HOSTELLERS ? "primary" : "secondary"}
                  onClick={() => handleEligibilityModeChange(ELIGIBILITY_MODE_ALL_HOSTELLERS)}>
                  All Hostellers
                </Button>
                <Button type="button" variant={formData.eligibilityMode === ELIGIBILITY_MODE_ALL_ACTIVE ? "primary" : "secondary"}
                  onClick={() => handleEligibilityModeChange(ELIGIBILITY_MODE_ALL_ACTIVE)}>
                  All Active Students
                </Button>
                <Button type="button" variant={formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM ? "primary" : "secondary"}
                  onClick={() => handleEligibilityModeChange(ELIGIBILITY_MODE_CUSTOM)}>
                  Custom Roll Number CSV
                </Button>
              </HStack>
              <Text color="muted" size="sm">
                {formData.eligibilityMode === ELIGIBILITY_MODE_ALL_HOSTELLERS
                  ? "Every active student except day scholars."
                  : formData.eligibilityMode === ELIGIBILITY_MODE_ALL_ACTIVE
                    ? "Every active student, day scholars included."
                    : "Only the active students on the uploaded roll list."}
              </Text>
              {formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM && (
                <RollNumberCsvInput
                  rollNumbers={formData.eligibleRollNumbers}
                  onChange={(rollNumbers) => setFormData((p) => ({ ...p, eligibleRollNumbers: rollNumbers }))}
                />
              )}
            </VStack>
          )}

          {/* ALLOCATION TAGS */}
          {activeTab === "tags" && (
            <VStack gap="small">
              <HStack justify="between" align="center">
                <Label>Allocation Tags</Label>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                  <Plus size={16} /> Add Tag
                </Button>
              </HStack>
              <Alert type="info" icon>
                Students answer each tag yes/no when choosing a caterer. Students who never answer (auto-allocated or
                placed by the office) get the default.
              </Alert>
              {formData.tags.length === 0 && (
                <Text size="sm" color="muted">
                  No tags yet. Add one if the caterer needs to know something about each student, such as “Jain food”.
                </Text>
              )}
              <Grid cols={1} gap={3}>
                {formData.tags.map((tag, index) => (
                  <div key={tag.key} style={tagTile}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
                      <Button type="button" variant="ghost" size="sm" title="Move up" aria-label="Move tag up"
                        onClick={() => handleMoveTag(index, -1)} disabled={index === 0}>
                        <ChevronUp size={16} />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" title="Move down" aria-label="Move tag down"
                        onClick={() => handleMoveTag(index, 1)} disabled={index === formData.tags.length - 1}>
                        <ChevronDown size={16} />
                      </Button>
                    </div>
                    <VStack gap="small">
                      <Grid min={200} gap={3}>
                        <Field label="Name" htmlFor={`tag-name-${tag.key}`} required>
                          <Input id={`tag-name-${tag.key}`} value={tag.name} placeholder="Jain food" maxLength={60}
                            onChange={(e) => handleTagChange(tag.key, "name", e.target.value)} />
                        </Field>
                        <Field label="Question" htmlFor={`tag-question-${tag.key}`}>
                          <Input id={`tag-question-${tag.key}`} value={tag.question} placeholder="Do you want Jain food?"
                            onChange={(e) => handleTagChange(tag.key, "question", e.target.value)} />
                        </Field>
                      </Grid>
                      <Field label="Default answer" required
                        help="Used for students who don’t answer.">
                        <ToggleButtonGroup
                          options={DEFAULT_ANSWER_OPTIONS}
                          value={tag.defaultValue}
                          onChange={(value) => handleTagChange(tag.key, "defaultValue", value)}
                          shape="rounded"
                          size="small"
                          hideLabelsOnMobile={false}
                        />
                      </Field>
                    </VStack>
                    <Button type="button" variant="secondary" size="md" title="Remove tag" aria-label="Remove tag"
                      onClick={() => handleRemoveTag(tag)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </Grid>
            </VStack>
          )}
        </VStack>
      </form>
      <ConfirmDialog
        isOpen={Boolean(tagToRemove)}
        onClose={() => setTagToRemove(null)}
        onConfirm={() => {
          if (tagToRemove) removeTag(tagToRemove.key)
          setTagToRemove(null)
        }}
        title="Remove this tag?"
        message={`Students’ answers for “${tagToRemove?.name || "this tag"}” are kept, but the tag is archived and stops applying once you save.`}
        confirmText="Remove tag"
        isDestructive
      />
      <MealPlannerModal
        isOpen={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        onApply={(schedule) => setFormData((prev) => ({ ...prev, ...schedule }))}
        mealSlots={formData.mealSlots}
        weekSchedule={formData.weekSchedule}
        dateSchedule={formData.dateSchedule}
        startDate={formData.startDate}
        endDate={formData.endDate}
      />
    </Modal>
  )
}

export default PeriodFormModal
