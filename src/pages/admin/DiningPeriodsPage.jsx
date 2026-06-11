import { useEffect, useMemo, useRef, useState } from "react"
import Papa from "papaparse"
import { Button, Input, Modal, Table } from "czero/react"
import {
  Archive,
  CalendarDays,
  FileDown,
  FileUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { adminApi } from "../../service"
import { Alert, EmptyState, FileInput, HStack, Label, SearchInput, StatCards, VStack } from "@/components/ui"
import { BULK_RECORD_LIMIT_MESSAGE, MAX_BULK_RECORDS } from "@/constants/systemLimits"

const ELIGIBILITY_MODE_ALL_ACTIVE = "all-active"
const ELIGIBILITY_MODE_CUSTOM = "custom"
const DEFAULT_MEAL_SLOTS = [
  { name: "Breakfast", startTime: "07:00", endTime: "10:00" },
  { name: "Lunch", startTime: "12:00", endTime: "15:00" },
  { name: "Dinner", startTime: "19:00", endTime: "22:00" },
]
const DEFAULT_REBATE_SETTINGS = {
  shortTermMaxTotalDays: 10,
  shortTermMaxContinuousDays: 3,
  shortTermMinApplicationDays: 1,
  shortTermMinAdvanceDays: 2,
}

const initialFormState = {
  startDate: "",
  endDate: "",
  allocationStartAt: "",
  allocationEndAt: "",
  catererIds: [],
  catererCapacities: [],
  mealSlots: DEFAULT_MEAL_SLOTS,
  rebateSettings: DEFAULT_REBATE_SETTINGS,
  eligibilityMode: ELIGIBILITY_MODE_ALL_ACTIVE,
  eligibleRollNumbers: [],
}

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback
}

const toDateInputValue = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

const toDateTimeInputValue = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

const formatDate = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const getIdValue = (value) => String(value?.id || value?._id || value || "")

const normalizeCapacityValue = (value) => String(Math.max(1, Number(value || 1)))

const normalizeRebateSettings = (settings = {}) => ({
  shortTermMaxTotalDays: String(Math.max(0, Number(settings.shortTermMaxTotalDays ?? DEFAULT_REBATE_SETTINGS.shortTermMaxTotalDays))),
  shortTermMaxContinuousDays: String(Math.max(1, Number(settings.shortTermMaxContinuousDays ?? DEFAULT_REBATE_SETTINGS.shortTermMaxContinuousDays))),
  shortTermMinApplicationDays: String(Math.max(1, Number(settings.shortTermMinApplicationDays ?? DEFAULT_REBATE_SETTINGS.shortTermMinApplicationDays))),
  shortTermMinAdvanceDays: String(Math.max(0, Number(settings.shortTermMinAdvanceDays ?? DEFAULT_REBATE_SETTINGS.shortTermMinAdvanceDays))),
})

const buildCapacityRows = (catererIds = [], capacities = []) => {
  const capacityByCaterer = new Map(
    (Array.isArray(capacities) ? capacities : []).map((entry) => [
      getIdValue(entry?.catererId),
      {
        catererId: getIdValue(entry?.catererId),
        maxStudentCount: normalizeCapacityValue(entry?.maxStudentCount),
        allocatedCount: Number(entry?.allocatedCount || 0),
      },
    ])
  )

  return (Array.isArray(catererIds) ? catererIds : [])
    .map(getIdValue)
    .filter(Boolean)
    .map((catererId) => (
      capacityByCaterer.get(catererId) || {
        catererId,
        maxStudentCount: "1",
        allocatedCount: 0,
      }
    ))
}

const normalizePeriod = (period = {}) => ({
  id: period.id || period._id,
  startDate: period.startDate,
  endDate: period.endDate,
  allocationStartAt: period.allocationStartAt,
  allocationEndAt: period.allocationEndAt,
  catererIds: Array.isArray(period.catererIds) ? period.catererIds.map(getIdValue).filter(Boolean) : [],
  caterers: Array.isArray(period.caterers) ? period.caterers : [],
  catererCapacities: Array.isArray(period.catererCapacities) ? period.catererCapacities.map((entry) => ({
    catererId: getIdValue(entry.catererId),
    maxStudentCount: Number(entry.maxStudentCount || 0),
    allocatedCount: Number(entry.allocatedCount || 0),
    remainingSeats: Number(entry.remainingSeats || 0),
  })) : [],
  mealSlots: Array.isArray(period.mealSlots) && period.mealSlots.length > 0 ? period.mealSlots : DEFAULT_MEAL_SLOTS,
  rebateSettings: {
    ...DEFAULT_REBATE_SETTINGS,
    ...(period.rebateSettings || {}),
  },
  totalCapacity: Number(period.totalCapacity || 0),
  eligibilityMode: period.eligibilityMode || ELIGIBILITY_MODE_ALL_ACTIVE,
  eligibleRollNumbers: Array.isArray(period.eligibleRollNumbers) ? period.eligibleRollNumbers : [],
  eligibleStudentCount: Number(period.eligibleStudentCount || 0),
  isArchived: Boolean(period.isArchived),
  status: period.status || "Upcoming",
  createdAt: period.createdAt,
  updatedAt: period.updatedAt,
})

const DiningPeriodStats = ({ periods, fetchArchive }) => {
  const openCount = periods.filter((period) => period.status === "Open").length
  const upcomingCount = periods.filter((period) => period.status === "Upcoming").length
  const customCount = periods.filter((period) => period.eligibilityMode === ELIGIBILITY_MODE_CUSTOM).length

  return (
    <StatCards
      columns={4}
      stats={[
        {
          title: fetchArchive ? "Archived Periods" : "Visible Periods",
          value: periods.length,
          subtitle: fetchArchive ? "Hidden dining windows" : "Dining allocation windows",
          icon: <CalendarDays size={20} />,
          color: "var(--color-primary)",
        },
        {
          title: "Open",
          value: openCount,
          subtitle: "Currently active",
          icon: <UtensilsCrossed size={20} />,
          color: "var(--color-success)",
        },
        {
          title: "Upcoming",
          value: upcomingCount,
          subtitle: "Scheduled later",
          icon: <CalendarDays size={20} />,
          color: "var(--color-warning)",
        },
        {
          title: "Custom Lists",
          value: customCount,
          subtitle: "CSV eligibility",
          icon: <Users size={20} />,
          color: "var(--color-primary)",
        },
      ]}
    />
  )
}

const RollNumberCsvInput = ({ rollNumbers, onChange, disabled = false }) => {
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
            results.data
              .map((row) => String(row.rollNumber || "").trim().toUpperCase())
              .filter(Boolean)
          ),
        ]

        if (parsedRollNumbers.length === 0) {
          setError("No roll numbers found in the CSV.")
          return
        }

        onChange(parsedRollNumbers)
      },
      error: (parseError) => {
        setError(`Error parsing CSV: ${parseError.message}`)
      },
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
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) fileInputRef.current?.click()
        }}
        style={{
          border: "var(--border-2) dashed var(--color-border-input)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--spacing-5)",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          backgroundColor: "var(--color-bg-hover)",
          opacity: disabled ? 0.65 : 1,
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
        <FileInput ref={fileInputRef} accept=".csv" onChange={handleFileChange} hidden disabled={disabled} />
      </div>

      <HStack justify="between" gap="small">
        <Button type="button" variant="secondary" size="sm" onClick={downloadTemplate}>
          <FileDown size={16} /> Download Template
        </Button>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          {rollNumbers.length} roll number{rollNumbers.length === 1 ? "" : "s"} loaded
        </span>
      </HStack>

      {error && (
        <Alert type="error" icon>
          {error}
        </Alert>
      )}
    </VStack>
  )
}

const formatRebateType = (type = "") => (
  type === "long-term" ? "Long-term" : "Short-term"
)

const formatRebateStatus = (status = "") => {
  if (status === "approved") return "Approved"
  if (status === "rejected") return "Rejected"
  return "Pending"
}

const DiningRebateRequests = ({ rebates, loading, onApprove, onReject }) => (
  <div className="mt-[var(--spacing-8)]">
    <HStack justify="between" align="center" style={{ marginBottom: "var(--spacing-4)" }}>
      <div>
        <h2 style={{ color: "var(--color-text-heading)", fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)" }}>
          Long-Term Rebate Requests
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          Pending requests need admin approval before caterer counts are reduced.
        </p>
      </div>
    </HStack>

    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Student</Table.Head>
            <Table.Head>Period</Table.Head>
            <Table.Head>Caterer</Table.Head>
            <Table.Head>Days</Table.Head>
            <Table.Head>Type</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rebates.map((rebate) => (
            <Table.Row key={rebate.id}>
              <Table.Cell>
                <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>
                  {rebate.student?.name || "Student"}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  {rebate.rollNumber}
                </div>
              </Table.Cell>
              <Table.Cell>{formatDate(rebate.startDate)} - {formatDate(rebate.endDate)}</Table.Cell>
              <Table.Cell>{rebate.caterer?.name || "-"}</Table.Cell>
              <Table.Cell>{rebate.dayCount}</Table.Cell>
              <Table.Cell>{formatRebateType(rebate.type)}</Table.Cell>
              <Table.Cell>{formatRebateStatus(rebate.status)}</Table.Cell>
              <Table.Cell>
                {rebate.status === "pending" ? (
                  <HStack gap="small">
                    <Button variant="primary" size="sm" onClick={() => onApprove(rebate)}>
                      <CheckCircle2 size={16} /> Approve
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onReject(rebate)}>
                      <XCircle size={16} /> Reject
                    </Button>
                  </HStack>
                ) : "-"}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>

    {!loading && rebates.length === 0 && (
      <Alert type="info" icon style={{ marginTop: "var(--spacing-4)" }}>
        No pending long-term rebate requests right now.
      </Alert>
    )}
  </div>
)

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const selectedCatererIds = Array.isArray(initialData.catererIds) ? initialData.catererIds.map(getIdValue).filter(Boolean) : []

    setFormData({
      startDate: toDateInputValue(initialData.startDate),
      endDate: toDateInputValue(initialData.endDate),
      allocationStartAt: toDateTimeInputValue(initialData.allocationStartAt),
      allocationEndAt: toDateTimeInputValue(initialData.allocationEndAt),
      catererIds: selectedCatererIds,
      catererCapacities: buildCapacityRows(selectedCatererIds, initialData.catererCapacities),
      mealSlots: Array.isArray(initialData.mealSlots) && initialData.mealSlots.length > 0
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
    setIsSubmitting(false)
  }, [initialData, isOpen])

  const handleCatererToggle = (catererId) => {
    setFormData((prev) => {
      const catererSet = new Set(prev.catererIds)
      let nextCapacities = Array.isArray(prev.catererCapacities) ? [...prev.catererCapacities] : []
      if (catererSet.has(catererId)) {
        const existingCapacity = nextCapacities.find((entry) => entry.catererId === catererId)
        if (Number(existingCapacity?.allocatedCount || 0) > 0) {
          setError("This caterer already has student allocations. Archive the period or keep the caterer selected.")
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
        ? prev.catererCapacities.map((entry) => (
          entry.catererId === catererId ? { ...entry, maxStudentCount: nextValue } : entry
        ))
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
      mealSlots: prev.mealSlots.map((slot, slotIndex) => (
        slotIndex === index ? { ...slot, [field]: value } : slot
      )),
    }))
  }

  const handleAddMealSlot = () => {
    setFormData((prev) => ({
      ...prev,
      mealSlots: [...prev.mealSlots, { name: "", startTime: "", endTime: "" }],
    }))
  }

  const handleRemoveMealSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      mealSlots: prev.mealSlots.filter((_, slotIndex) => slotIndex !== index),
    }))
  }

  const handleRebateSettingChange = (field, value) => {
    const nextValue = String(value || "").replace(/[^\d]/g, "")
    setFormData((prev) => ({
      ...prev,
      rebateSettings: {
        ...prev.rebateSettings,
        [field]: nextValue,
      },
    }))
  }

  const validateForm = () => {
    if (!formData.startDate || !formData.endDate) return "Start date and end date are required."
    if (!formData.allocationStartAt || !formData.allocationEndAt) return "Allocation start and end time are required."
    if (new Date(formData.startDate) > new Date(formData.endDate)) return "Start date must be before or equal to end date."
    if (new Date(formData.allocationStartAt) > new Date(formData.allocationEndAt)) return "Allocation start time must be before or equal to allocation end time."
    if (formData.catererIds.length === 0) return "Please select at least one caterer."
    if (formData.catererCapacities.some((entry) => Number(entry.maxStudentCount || 0) < 1)) {
      return "Each selected caterer must have a max student count of at least 1."
    }
    if (formData.mealSlots.length === 0) return "Please add at least one meal verification slot."
    if (formData.mealSlots.some((slot) => !slot.name.trim() || !slot.startTime || !slot.endTime)) {
      return "Each meal verification slot must have a name, start time, and end time."
    }
    const rebateSettings = formData.rebateSettings || {}
    if (Number(rebateSettings.shortTermMaxTotalDays || 0) < 0) return "Short-term total days cannot be negative."
    if (Number(rebateSettings.shortTermMaxContinuousDays || 0) < 1) return "Short-term max continuous days must be at least 1."
    if (Number(rebateSettings.shortTermMinApplicationDays || 0) < 1) return "Short-term minimum application days must be at least 1."
    if (Number(rebateSettings.shortTermMinApplicationDays || 0) > Number(rebateSettings.shortTermMaxContinuousDays || 0)) {
      return "Minimum application days cannot exceed max continuous short-term days."
    }
    if (formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM && formData.eligibleRollNumbers.length === 0) {
      return "Please upload at least one roll number for custom eligibility."
    }
    return ""
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationMessage = validateForm()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setIsSubmitting(true)
    try {
      const normalizedCapacities = formData.catererCapacities.map((entry) => ({
        ...entry,
        maxStudentCount: Number(entry.maxStudentCount || 0),
        allocatedCount: Number(entry.allocatedCount || 0),
      }))

      await onSubmit({
        startDate: formData.startDate,
        endDate: formData.endDate,
        allocationStartAt: formData.allocationStartAt,
        allocationEndAt: formData.allocationEndAt,
        catererIds: formData.catererIds,
        catererCapacities: normalizedCapacities,
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
        eligibleRollNumbers: formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM ? formData.eligibleRollNumbers : [],
      })
      onClose()
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to save dining period. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width={820} minHeight="60vh">
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && (
            <Alert type="error" icon>
              {error}
            </Alert>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-4)" }}>
            <div>
              <Label htmlFor="startDate" required>Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, startDate: event.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate" required>End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, endDate: event.target.value }))}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-4)" }}>
            <div>
              <Label htmlFor="allocationStartAt" required>Allocation Start Time</Label>
              <Input
                id="allocationStartAt"
                type="datetime-local"
                value={formData.allocationStartAt}
                onChange={(event) => setFormData((prev) => ({ ...prev, allocationStartAt: event.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="allocationEndAt" required>Allocation End Time</Label>
              <Input
                id="allocationEndAt"
                type="datetime-local"
                value={formData.allocationEndAt}
                onChange={(event) => setFormData((prev) => ({ ...prev, allocationEndAt: event.target.value }))}
                required
              />
            </div>
          </div>

          <VStack gap="small">
            <HStack justify="between" align="center">
              <Label required>Meal Verification Slots</Label>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddMealSlot}>
                <Plus size={16} /> Add Slot
              </Button>
            </HStack>

            <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
              {formData.mealSlots.map((slot, index) => (
                <div
                  key={`${slot.name}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(140px, 1fr) minmax(110px, 140px) minmax(110px, 140px) auto",
                    gap: "var(--spacing-3)",
                    alignItems: "end",
                    padding: "var(--spacing-3)",
                    border: "var(--border-1) solid var(--color-border-light)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-bg-primary)",
                  }}
                >
                  <div>
                    <Label htmlFor={`meal-slot-name-${index}`} required>Name</Label>
                    <Input
                      id={`meal-slot-name-${index}`}
                      value={slot.name}
                      onChange={(event) => handleMealSlotChange(index, "name", event.target.value)}
                      placeholder="Breakfast"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`meal-slot-start-${index}`} required>Start</Label>
                    <Input
                      id={`meal-slot-start-${index}`}
                      type="time"
                      value={slot.startTime}
                      onChange={(event) => handleMealSlotChange(index, "startTime", event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`meal-slot-end-${index}`} required>End</Label>
                    <Input
                      id={`meal-slot-end-${index}`}
                      type="time"
                      value={slot.endTime}
                      onChange={(event) => handleMealSlotChange(index, "endTime", event.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => handleRemoveMealSlot(index)}
                    disabled={formData.mealSlots.length <= 1}
                    title="Remove slot"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </VStack>

          <VStack gap="small">
            <Label required>Short-Term Rebate Rules</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--spacing-4)" }}>
              <div>
                <Label htmlFor="rebate-total-days" required>Max Total Days</Label>
                <Input
                  id="rebate-total-days"
                  type="number"
                  min="0"
                  value={formData.rebateSettings.shortTermMaxTotalDays}
                  onChange={(event) => handleRebateSettingChange("shortTermMaxTotalDays", event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rebate-continuous-days" required>Max Continuous Days</Label>
                <Input
                  id="rebate-continuous-days"
                  type="number"
                  min="1"
                  value={formData.rebateSettings.shortTermMaxContinuousDays}
                  onChange={(event) => handleRebateSettingChange("shortTermMaxContinuousDays", event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rebate-min-days" required>Min Days / Request</Label>
                <Input
                  id="rebate-min-days"
                  type="number"
                  min="1"
                  value={formData.rebateSettings.shortTermMinApplicationDays}
                  onChange={(event) => handleRebateSettingChange("shortTermMinApplicationDays", event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rebate-advance-days" required>Advance Notice Days</Label>
                <Input
                  id="rebate-advance-days"
                  type="number"
                  min="0"
                  value={formData.rebateSettings.shortTermMinAdvanceDays}
                  onChange={(event) => handleRebateSettingChange("shortTermMinAdvanceDays", event.target.value)}
                  required
                />
              </div>
            </div>
            <Alert type="info" icon>
              Requests within the continuous-day limit are auto-approved only when these rules pass. Longer requests go to admin approval.
            </Alert>
          </VStack>

          <VStack gap="small">
            <Label required>Allowed Caterers</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-2)" }}>
              {caterers.map((caterer) => {
                const capacity = formData.catererCapacities.find((entry) => entry.catererId === caterer.id)

                return (
                <div
                  key={caterer.id}
                  style={{
                    display: "flex",
                    gap: "var(--spacing-2)",
                    alignItems: "flex-start",
                    padding: "var(--spacing-3)",
                    border: "var(--border-1) solid var(--color-border-light)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: formData.catererIds.includes(caterer.id) ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.catererIds.includes(caterer.id)}
                    onChange={() => handleCatererToggle(caterer.id)}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    <span style={{ display: "block", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-semibold)" }}>{caterer.name}</span>
                    <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{caterer.email}</span>
                    {formData.catererIds.includes(caterer.id) && (
                      <span style={{ display: "block", marginTop: "var(--spacing-2)" }}>
                        <Label htmlFor={`capacity-${caterer.id}`} required>Max Students</Label>
                        <Input
                          id={`capacity-${caterer.id}`}
                          type="number"
                          min="1"
                          value={capacity?.maxStudentCount ?? ""}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => handleCapacityChange(caterer.id, event.target.value)}
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
            {caterers.length === 0 && (
              <Alert type="warning" icon>
                No active caterers found. Please add a caterer before creating a period.
              </Alert>
            )}
          </VStack>

          <VStack gap="small">
            <Label required>Student Eligibility</Label>
            <HStack gap="small" style={{ flexWrap: "wrap" }}>
              <Button
                type="button"
                variant={formData.eligibilityMode === ELIGIBILITY_MODE_ALL_ACTIVE ? "primary" : "secondary"}
                onClick={() => handleEligibilityModeChange(ELIGIBILITY_MODE_ALL_ACTIVE)}
              >
                All Active Students
              </Button>
              <Button
                type="button"
                variant={formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM ? "primary" : "secondary"}
                onClick={() => handleEligibilityModeChange(ELIGIBILITY_MODE_CUSTOM)}
              >
                Custom Roll Number CSV
              </Button>
            </HStack>

            {formData.eligibilityMode === ELIGIBILITY_MODE_CUSTOM && (
              <RollNumberCsvInput
                rollNumbers={formData.eligibleRollNumbers}
                onChange={(rollNumbers) => setFormData((prev) => ({ ...prev, eligibleRollNumbers: rollNumbers }))}
              />
            )}
          </VStack>

          {archiveAction && (
            <Button type="button" variant="secondary" fullWidth onClick={archiveAction.onClick}>
              <Archive size={16} /> {archiveAction.label}
            </Button>
          )}

          <HStack justify="end" gap="small" style={{ paddingTop: "var(--spacing-5)", marginTop: "auto", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={isSubmitting} disabled={isSubmitting || caterers.length === 0}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

const DiningPeriodsPage = () => {
  const [periods, setPeriods] = useState([])
  const [caterers, setCaterers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [fetchArchive, setFetchArchive] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState(null)
  const [rebateRequests, setRebateRequests] = useState([])
  const [rebatesLoading, setRebatesLoading] = useState(false)

  const filteredPeriods = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return periods

    return periods.filter((period) => {
      const catererNames = period.caterers.map((caterer) => caterer.name).join(" ")
      return (
        period.status.toLowerCase().includes(normalizedSearch) ||
        period.eligibilityMode.toLowerCase().includes(normalizedSearch) ||
        catererNames.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [periods, searchTerm])

  const fetchPeriods = async (archive = fetchArchive) => {
    try {
      const response = await adminApi.getAllDiningPeriods(archive ? "archive=true" : "")
      setPeriods(Array.isArray(response) ? response.map(normalizePeriod) : [])
    } catch (error) {
      console.error("Error fetching dining periods:", error)
      setPeriods([])
    }
  }

  const fetchCaterers = async () => {
    try {
      const response = await adminApi.getAllCaterers("")
      setCaterers(Array.isArray(response) ? response.map((caterer) => ({
        id: String(caterer.id || caterer._id),
        name: caterer.name || "",
        email: caterer.email || "",
      })) : [])
    } catch (error) {
      console.error("Error fetching caterers:", error)
      setCaterers([])
    }
  }

  const fetchRebateRequests = async () => {
    setRebatesLoading(true)
    try {
      const response = await adminApi.getDiningRebates({ status: "pending" })
      setRebateRequests(Array.isArray(response?.rebates) ? response.rebates : [])
    } catch (error) {
      console.error("Error fetching dining rebate requests:", error)
      setRebateRequests([])
    } finally {
      setRebatesLoading(false)
    }
  }

  const handleArchiveToggle = () => {
    const nextArchiveState = !fetchArchive
    setFetchArchive(nextArchiveState)
    fetchPeriods(nextArchiveState)
  }

  const handleAddPeriod = async (payload) => {
    await adminApi.addDiningPeriod(payload)
    await fetchPeriods()
  }

  const handleUpdatePeriod = async (payload) => {
    if (!editingPeriod?.id) return
    await adminApi.updateDiningPeriod(editingPeriod.id, payload)
    setEditingPeriod(null)
    await fetchPeriods()
  }

  const handleArchivePeriod = async () => {
    if (!editingPeriod?.id) return

    const action = editingPeriod.isArchived ? "unarchive" : "archive"
    const shouldProceed = window.confirm(`Are you sure you want to ${action} this dining period?`)
    if (!shouldProceed) return

    try {
      await adminApi.changeDiningPeriodArchiveStatus(editingPeriod.id, !editingPeriod.isArchived)
      setEditingPeriod(null)
      await fetchPeriods()
    } catch (error) {
      alert(getErrorMessage(error, `Unable to ${action} dining period. Please try again.`))
    }
  }

  const handleApproveRebate = async (rebate) => {
    const shouldProceed = window.confirm(`Approve rebate for ${rebate.rollNumber} from ${formatDate(rebate.startDate)} to ${formatDate(rebate.endDate)}?`)
    if (!shouldProceed) return

    try {
      await adminApi.approveDiningRebate(rebate.id)
      await fetchRebateRequests()
    } catch (error) {
      alert(getErrorMessage(error, "Unable to approve rebate. Please try again."))
    }
  }

  const handleRejectRebate = async (rebate) => {
    const comment = window.prompt("Reason/comment for rejection")
    if (comment === null) return

    try {
      await adminApi.rejectDiningRebate(rebate.id, comment)
      await fetchRebateRequests()
    } catch (error) {
      alert(getErrorMessage(error, "Unable to reject rebate. Please try again."))
    }
  }

  useEffect(() => {
    fetchPeriods(false)
    fetchCaterers()
    fetchRebateRequests()
  }, [])

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Dining Periods">
          <Button variant="secondary" onClick={handleArchiveToggle}>
            <Archive size={18} /> {fetchArchive ? "Show Active" : "Show Archived"}
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Period
          </Button>
        </PageHeader>

        <div className="flex-1 overflow-y-scroll px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)] py-[var(--spacing-6)]">
          <DiningPeriodStats periods={periods} fetchArchive={fetchArchive} />

          <div className="mt-[var(--spacing-8)] flex justify-end">
            <div className="w-full sm:w-[18rem]">
              <SearchInput
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search periods..."
              />
            </div>
          </div>

          <div className="mt-[var(--spacing-6)] overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Period</Table.Head>
                    <Table.Head>Caterers</Table.Head>
                    <Table.Head>Students</Table.Head>
                    <Table.Head>Capacity</Table.Head>
                    <Table.Head>Meal Slots</Table.Head>
                    <Table.Head>Status</Table.Head>
                    <Table.Head>Allocation</Table.Head>
                    <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredPeriods.map((period) => (
                  <Table.Row key={period.id}>
                    <Table.Cell>
                      <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {period.caterers.length > 0 ? period.caterers.map((caterer) => caterer.name).join(", ") : "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {period.eligibilityMode === ELIGIBILITY_MODE_ALL_ACTIVE ? "All active students" : "Custom CSV"} ({period.eligibleStudentCount})
                    </Table.Cell>
                    <Table.Cell>{period.totalCapacity}</Table.Cell>
                    <Table.Cell>
                      {period.mealSlots?.length ? period.mealSlots.map((slot) => `${slot.name} ${slot.startTime}-${slot.endTime}`).join(", ") : "-"}
                    </Table.Cell>
                    <Table.Cell>{period.status}</Table.Cell>
                    <Table.Cell>{period.allocationStatus}</Table.Cell>
                    <Table.Cell>
                      <Button variant="secondary" size="sm" onClick={() => setEditingPeriod(period)}>
                        <Pencil size={16} /> Edit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {filteredPeriods.length === 0 && (
            <EmptyState
              icon={Search}
              title="No Dining Periods Found"
              message="No dining periods match your search criteria. Try adjusting your search or archive view."
            />
          )}

          <DiningRebateRequests
            rebates={rebateRequests}
            loading={rebatesLoading}
            onApprove={handleApproveRebate}
            onReject={handleRejectRebate}
          />
        </div>
      </div>

      <PeriodFormModal
        isOpen={showAddModal}
        title="Add Dining Period"
        submitLabel="Create Period"
        caterers={caterers}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPeriod}
      />

      <PeriodFormModal
        isOpen={Boolean(editingPeriod)}
        title="Edit Dining Period"
        submitLabel="Save Changes"
        initialData={editingPeriod || initialFormState}
        caterers={caterers}
        onClose={() => setEditingPeriod(null)}
        onSubmit={handleUpdatePeriod}
        archiveAction={
          editingPeriod
            ? {
              label: editingPeriod.isArchived ? "Unarchive Period" : "Archive Period",
              onClick: handleArchivePeriod,
            }
            : null
        }
      />
    </>
  )
}

export default DiningPeriodsPage
