import { useEffect, useRef, useState } from "react"
import Papa from "papaparse"
import { Alert, Button, Field, FileInput, Grid, HStack, Input, Label, Modal, Surface, Text, VStack } from "hzero"
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
  registrationEnabled: true,
  allocationStartAt: "",
  allocationEndAt: "",
  catererIds: [],
  catererCapacities: [],
  mealSlots: DEFAULT_MEAL_SLOTS,
  rebateSettings: normalizeRebateSettings(DEFAULT_REBATE_SETTINGS),
  dailyRate: "",
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
      dailyRate: initialData.dailyRate != null && initialData.dailyRate !== "" ? String(initialData.dailyRate) : "",
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
    if (new Date(formData.startDate) > new Date(formData.endDate))
      return fail("schedule", "Start date must be before or equal to end date.")
    if (formData.registrationEnabled) {
      if (!formData.allocationStartAt || !formData.allocationEndAt)
        return fail("schedule", "Allocation start and end time are required.")
      if (new Date(formData.allocationStartAt) > new Date(formData.allocationEndAt))
        return fail("schedule", "Allocation start time must be before or equal to allocation end time.")
    }

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
        registrationEnabled: formData.registrationEnabled,
        allocationStartAt: formData.registrationEnabled ? formData.allocationStartAt : "",
        allocationEndAt: formData.registrationEnabled ? formData.allocationEndAt : "",
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
        dailyRate: Number(formData.dailyRate || 0),
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
                </Grid>
              ) : (
                <Alert type="warning" icon>
                  Self-registration is off. Students won’t see this period to pick a caterer — assign them yourself
                  from the “Manage Students” action on the period card (single, or bulk by roll-number CSV).
                </Alert>
              )}
              <Grid min={220} gap={4}>
                <Field label="Daily Rate (₹ / day)" htmlFor="dailyRate">
                  <Input id="dailyRate" type="number" min="0" step="0.01" placeholder="0"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData((p) => ({ ...p, dailyRate: e.target.value }))} />
                </Field>
              </Grid>
              <Alert type="info" icon>
                The period dates control when meals are verified. The daily rate is what each eligible student is
                billed per day in this period (skipping approved-rebate days) — used by billing periods.
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
            </VStack>
          )}

          {/* REBATES */}
          {activeTab === "rebates" && (
            <VStack gap="small">
              <Label required>Short-Term Rebate Rules</Label>
              <Grid min={180} gap={4}>
                <Field label="Max Total Days" htmlFor="rebate-total-days" required>
                  <Input id="rebate-total-days" type="number" min="0" value={formData.rebateSettings.shortTermMaxTotalDays}
                    onChange={(e) => handleRebateSettingChange("shortTermMaxTotalDays", e.target.value)} required />
                </Field>
                <Field label="Max Continuous Days" htmlFor="rebate-continuous-days" required>
                  <Input id="rebate-continuous-days" type="number" min="1" value={formData.rebateSettings.shortTermMaxContinuousDays}
                    onChange={(e) => handleRebateSettingChange("shortTermMaxContinuousDays", e.target.value)} required />
                </Field>
                <Field label="Min Days / Request" htmlFor="rebate-min-days" required>
                  <Input id="rebate-min-days" type="number" min="1" value={formData.rebateSettings.shortTermMinApplicationDays}
                    onChange={(e) => handleRebateSettingChange("shortTermMinApplicationDays", e.target.value)} required />
                </Field>
                <Field label="Advance Notice Days" htmlFor="rebate-advance-days" required>
                  <Input id="rebate-advance-days" type="number" min="0" value={formData.rebateSettings.shortTermMinAdvanceDays}
                    onChange={(e) => handleRebateSettingChange("shortTermMinAdvanceDays", e.target.value)} required />
                </Field>
              </Grid>
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
