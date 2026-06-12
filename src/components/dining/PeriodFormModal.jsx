import { useEffect, useMemo, useRef, useState } from "react"
import Papa from "papaparse"
import { Button, Input, Modal } from "czero/react"
import {
  Archive,
  ArchiveRestore,
  CalendarClock,
  FileDown,
  FileUp,
  Plus,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react"
import { Alert, FileInput, HStack, Label, VStack } from "@/components/ui"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"
import {
  DEFAULT_MEAL_SLOTS,
  DEFAULT_REBATE_SETTINGS,
  ELIGIBILITY_MODE_ALL_ACTIVE,
  ELIGIBILITY_MODE_CUSTOM,
  buildCapacityRows,
  getErrorMessage,
  getIdValue,
  normalizeRebateSettings,
  toDateInputValue,
  toDateTimeInputValue,
} from "./diningPeriodHelpers"

const FORM_TABS = [
  { id: "schedule", name: "Schedule", icon: <CalendarClock size={14} /> },
  { id: "caterers", name: "Caterers", icon: <Users size={14} /> },
  { id: "meals", name: "Meal Slots", icon: <UtensilsCrossed size={14} /> },
  { id: "rebates", name: "Rebates", icon: <Archive size={14} /> },
  { id: "eligibility", name: "Eligibility", icon: <Users size={14} /> },
]

const initialFormState = {
  startDate: "",
  endDate: "",
  allocationStartAt: "",
  allocationEndAt: "",
  catererIds: [],
  catererCapacities: [],
  mealSlots: DEFAULT_MEAL_SLOTS,
  rebateSettings: normalizeRebateSettings(DEFAULT_REBATE_SETTINGS),
  eligibilityMode: ELIGIBILITY_MODE_ALL_ACTIVE,
  eligibleRollNumbers: [],
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
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click()
        }}
        style={{
          border: "2px dashed var(--color-border-input)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--spacing-5)",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: "var(--color-bg-hover)",
        }}
      >
        <FileUp size={28} style={{ margin: "0 auto var(--spacing-2)", color: "var(--color-text-muted)" }} />
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          Upload CSV with a <strong>rollNumber</strong> column
        </p>
        {fileName && (
          <p style={{ color: "var(--color-primary)", fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-2)" }}>
            Selected: {fileName}
          </p>
        )}
        <FileInput ref={fileInputRef} accept=".csv" onChange={handleFileChange} hidden />
      </div>

      <HStack justify="between" gap="small">
        <Button type="button" variant="secondary" size="sm" onClick={downloadTemplate}>
          <FileDown size={16} /> Download Template
        </Button>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          {rollNumbers.length} roll number{rollNumbers.length === 1 ? "" : "s"} loaded
        </span>
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

/**
 * Create / edit a dining period. Sections are split across header tabs;
 * validation failures jump to the offending tab so nothing hides off-screen.
 */
const PeriodFormModal = ({
  isOpen,
  title,
  submitLabel,
  initialData = initialFormState,
  caterers,
  onClose,
  onSubmit,
  archiveAction = null,
}) => {
  const [formData, setFormData] = useState(initialFormState)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("schedule")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const selectedCatererIds = Array.isArray(initialData.catererIds)
      ? initialData.catererIds.map(getIdValue).filter(Boolean)
      : []

    setFormData({
      startDate: toDateInputValue(initialData.startDate),
      endDate: toDateInputValue(initialData.endDate),
      allocationStartAt: toDateTimeInputValue(initialData.allocationStartAt),
      allocationEndAt: toDateTimeInputValue(initialData.allocationEndAt),
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
      rebateSettings: normalizeRebateSettings(initialData.rebateSettings || DEFAULT_REBATE_SETTINGS),
      eligibilityMode: initialData.eligibilityMode || ELIGIBILITY_MODE_ALL_ACTIVE,
      eligibleRollNumbers: Array.isArray(initialData.eligibleRollNumbers) ? initialData.eligibleRollNumbers : [],
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
      eligibleRollNumbers: mode === ELIGIBILITY_MODE_ALL_ACTIVE ? [] : prev.eligibleRollNumbers,
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

  const handleRebateSettingChange = (field, value) => {
    const nextValue = String(value || "").replace(/[^\d]/g, "")
    setFormData((prev) => ({ ...prev, rebateSettings: { ...prev.rebateSettings, [field]: nextValue } }))
  }

  /** Returns { tab, message } for the first failure, or null when valid. */
  const validateForm = () => {
    const fail = (tab, message) => ({ tab, message })

    if (!formData.startDate || !formData.endDate) return fail("schedule", "Start date and end date are required.")
    if (!formData.allocationStartAt || !formData.allocationEndAt)
      return fail("schedule", "Allocation start and end time are required.")
    if (new Date(formData.startDate) > new Date(formData.endDate))
      return fail("schedule", "Start date must be before or equal to end date.")
    if (new Date(formData.allocationStartAt) > new Date(formData.allocationEndAt))
      return fail("schedule", "Allocation start time must be before or equal to allocation end time.")

    if (formData.catererIds.length === 0) return fail("caterers", "Please select at least one caterer.")
    if (formData.catererCapacities.some((entry) => Number(entry.maxStudentCount || 0) < 1))
      return fail("caterers", "Each selected caterer must have a max student count of at least 1.")

    if (formData.mealSlots.length === 0) return fail("meals", "Please add at least one meal verification slot.")
    if (formData.mealSlots.some((slot) => !slot.name.trim() || !slot.startTime || !slot.endTime))
      return fail("meals", "Each meal slot must have a name, start time, and end time.")

    const rebate = formData.rebateSettings || {}
    if (Number(rebate.shortTermMaxContinuousDays || 0) < 1)
      return fail("rebates", "Short-term max continuous days must be at least 1.")
    if (Number(rebate.shortTermMinApplicationDays || 0) < 1)
      return fail("rebates", "Short-term minimum application days must be at least 1.")
    if (Number(rebate.shortTermMinApplicationDays || 0) > Number(rebate.shortTermMaxContinuousDays || 0))
      return fail("rebates", "Minimum application days cannot exceed max continuous short-term days.")

    if (formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM && formData.eligibleRollNumbers.length === 0)
      return fail("eligibility", "Please upload at least one roll number for custom eligibility.")

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
        allocationStartAt: formData.allocationStartAt,
        allocationEndAt: formData.allocationEndAt,
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
        rebateSettings: {
          shortTermMaxTotalDays: Number(formData.rebateSettings.shortTermMaxTotalDays || 0),
          shortTermMaxContinuousDays: Number(formData.rebateSettings.shortTermMaxContinuousDays || 0),
          shortTermMinApplicationDays: Number(formData.rebateSettings.shortTermMinApplicationDays || 0),
          shortTermMinAdvanceDays: Number(formData.rebateSettings.shortTermMinAdvanceDays || 0),
        },
        eligibilityMode: formData.eligibilityMode,
        eligibleRollNumbers:
          formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM ? formData.eligibleRollNumbers : [],
      })
      onClose()
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to save dining period. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const noCaterers = caterers.length === 0

  const footer = useMemo(
    () => (
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
          <Button type="submit" form="dining-period-form" variant="primary" loading={isSubmitting} disabled={isSubmitting || noCaterers}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </HStack>
      </div>
    ),
    [archiveAction, isSubmitting, noCaterers, onClose, submitLabel]
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-4)" }}>
                <div>
                  <Label htmlFor="startDate" required>Start Date</Label>
                  <Input id="startDate" type="date" value={formData.startDate}
                    onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="endDate" required>End Date</Label>
                  <Input id="endDate" type="date" value={formData.endDate}
                    onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-4)" }}>
                <div>
                  <Label htmlFor="allocationStartAt" required>Allocation Opens</Label>
                  <Input id="allocationStartAt" type="datetime-local" value={formData.allocationStartAt}
                    onChange={(e) => setFormData((p) => ({ ...p, allocationStartAt: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="allocationEndAt" required>Allocation Closes</Label>
                  <Input id="allocationEndAt" type="datetime-local" value={formData.allocationEndAt}
                    onChange={(e) => setFormData((p) => ({ ...p, allocationEndAt: e.target.value }))} required />
                </div>
              </div>
              <Alert type="info" icon>
                Students can pick a caterer only while the allocation window is open. The period dates control when meals are verified.
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--spacing-2)" }}>
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
                        <span style={{ display: "block", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-semibold)" }}>
                          {caterer.name}
                        </span>
                        <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                          {caterer.email}
                        </span>
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
                              <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                                Already allocated: {capacity?.allocatedCount}
                              </span>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
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
              <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                {formData.mealSlots.map((slot, index) => (
                  <div key={`${slot.name}-${index}`} style={sectionTile}>
                    <div>
                      <Label htmlFor={`meal-slot-name-${index}`} required>Name</Label>
                      <Input id={`meal-slot-name-${index}`} value={slot.name} placeholder="Breakfast"
                        onChange={(e) => handleMealSlotChange(index, "name", e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor={`meal-slot-start-${index}`} required>Start</Label>
                      <Input id={`meal-slot-start-${index}`} type="time" value={slot.startTime}
                        onChange={(e) => handleMealSlotChange(index, "startTime", e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor={`meal-slot-end-${index}`} required>End</Label>
                      <Input id={`meal-slot-end-${index}`} type="time" value={slot.endTime}
                        onChange={(e) => handleMealSlotChange(index, "endTime", e.target.value)} required />
                    </div>
                    <Button type="button" variant="secondary" size="md" title="Remove slot"
                      onClick={() => handleRemoveMealSlot(index)} disabled={formData.mealSlots.length <= 1}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </VStack>
          )}

          {/* REBATES */}
          {activeTab === "rebates" && (
            <VStack gap="small">
              <Label required>Short-Term Rebate Rules</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--spacing-4)" }}>
                <div>
                  <Label htmlFor="rebate-total-days" required>Max Total Days</Label>
                  <Input id="rebate-total-days" type="number" min="0" value={formData.rebateSettings.shortTermMaxTotalDays}
                    onChange={(e) => handleRebateSettingChange("shortTermMaxTotalDays", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="rebate-continuous-days" required>Max Continuous Days</Label>
                  <Input id="rebate-continuous-days" type="number" min="1" value={formData.rebateSettings.shortTermMaxContinuousDays}
                    onChange={(e) => handleRebateSettingChange("shortTermMaxContinuousDays", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="rebate-min-days" required>Min Days / Request</Label>
                  <Input id="rebate-min-days" type="number" min="1" value={formData.rebateSettings.shortTermMinApplicationDays}
                    onChange={(e) => handleRebateSettingChange("shortTermMinApplicationDays", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="rebate-advance-days" required>Advance Notice Days</Label>
                  <Input id="rebate-advance-days" type="number" min="0" value={formData.rebateSettings.shortTermMinAdvanceDays}
                    onChange={(e) => handleRebateSettingChange("shortTermMinAdvanceDays", e.target.value)} required />
                </div>
              </div>
              <Alert type="info" icon>
                Requests within the continuous-day limit are auto-approved only when these rules pass. Longer requests go to admin approval.
              </Alert>
            </VStack>
          )}

          {/* ELIGIBILITY */}
          {activeTab === "eligibility" && (
            <VStack gap="small">
              <Label required>Student Eligibility</Label>
              <HStack gap="small" style={{ flexWrap: "wrap" }}>
                <Button type="button" variant={formData.eligibilityMode === ELIGIBILITY_MODE_ALL_ACTIVE ? "primary" : "secondary"}
                  onClick={() => handleEligibilityModeChange(ELIGIBILITY_MODE_ALL_ACTIVE)}>
                  All Active Students
                </Button>
                <Button type="button" variant={formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM ? "primary" : "secondary"}
                  onClick={() => handleEligibilityModeChange(ELIGIBILITY_MODE_CUSTOM)}>
                  Custom Roll Number CSV
                </Button>
              </HStack>
              {formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM && (
                <RollNumberCsvInput
                  rollNumbers={formData.eligibleRollNumbers}
                  onChange={(rollNumbers) => setFormData((p) => ({ ...p, eligibleRollNumbers: rollNumbers }))}
                />
              )}
            </VStack>
          )}
        </VStack>
      </form>
    </Modal>
  )
}

export default PeriodFormModal
