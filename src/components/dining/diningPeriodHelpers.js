/**
 * Shared helpers, constants and serializers for the admin Dining Periods surface.
 * Kept framework-agnostic (no JSX) so it can be reused by cards, drawer and form.
 */

export const ELIGIBILITY_MODE_ALL_ACTIVE = "all-active"
export const ELIGIBILITY_MODE_CUSTOM = "custom"

export const DEFAULT_MEAL_SLOTS = [
  { name: "Breakfast", startTime: "07:00", endTime: "10:00" },
  { name: "Lunch", startTime: "12:00", endTime: "15:00" },
  { name: "Dinner", startTime: "19:00", endTime: "22:00" },
]

export const DEFAULT_REBATE_SETTINGS = {
  shortTermMaxTotalDays: 10,
  shortTermMaxContinuousDays: 3,
  shortTermMinApplicationDays: 1,
  shortTermMinAdvanceDays: 2,
}

export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const getIdValue = (value) => String(value?.id || value?._id || value || "")

export const toDateInputValue = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

export const toDateTimeInputValue = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
}

export const formatDateTime = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatDateRange = (start, end) => `${formatDate(start)} – ${formatDate(end)}`

export const normalizeCapacityValue = (value) => String(Math.max(1, Number(value || 1)))

export const normalizeRebateSettings = (settings = {}) => ({
  shortTermMaxTotalDays: String(
    Math.max(0, Number(settings.shortTermMaxTotalDays ?? DEFAULT_REBATE_SETTINGS.shortTermMaxTotalDays))
  ),
  shortTermMaxContinuousDays: String(
    Math.max(1, Number(settings.shortTermMaxContinuousDays ?? DEFAULT_REBATE_SETTINGS.shortTermMaxContinuousDays))
  ),
  shortTermMinApplicationDays: String(
    Math.max(1, Number(settings.shortTermMinApplicationDays ?? DEFAULT_REBATE_SETTINGS.shortTermMinApplicationDays))
  ),
  shortTermMinAdvanceDays: String(
    Math.max(0, Number(settings.shortTermMinAdvanceDays ?? DEFAULT_REBATE_SETTINGS.shortTermMinAdvanceDays))
  ),
})

export const buildCapacityRows = (catererIds = [], capacities = []) => {
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
    .map(
      (catererId) =>
        capacityByCaterer.get(catererId) || { catererId, maxStudentCount: "1", allocatedCount: 0 }
    )
}

/**
 * Normalizes a period from the API into a stable client shape.
 * Fixes the long-standing bug where `allocationStatus` (sent by the backend)
 * was dropped, leaving the allocation column/badge blank.
 */
export const normalizePeriod = (period = {}) => {
  const catererCapacities = Array.isArray(period.catererCapacities)
    ? period.catererCapacities.map((entry) => ({
        catererId: getIdValue(entry.catererId),
        caterer: entry.caterer || null,
        maxStudentCount: Number(entry.maxStudentCount || 0),
        allocatedCount: Number(entry.allocatedCount || 0),
        remainingSeats: Number(entry.remainingSeats ?? Math.max(Number(entry.maxStudentCount || 0) - Number(entry.allocatedCount || 0), 0)),
      }))
    : []

  const totalAllocated = catererCapacities.reduce((sum, entry) => sum + entry.allocatedCount, 0)

  return {
    id: period.id || period._id,
    startDate: period.startDate,
    endDate: period.endDate,
    allocationStartAt: period.allocationStartAt,
    allocationEndAt: period.allocationEndAt,
    catererIds: Array.isArray(period.catererIds) ? period.catererIds.map(getIdValue).filter(Boolean) : [],
    caterers: Array.isArray(period.caterers) ? period.caterers : [],
    catererCapacities,
    mealSlots:
      Array.isArray(period.mealSlots) && period.mealSlots.length > 0 ? period.mealSlots : DEFAULT_MEAL_SLOTS,
    rebateSettings: { ...DEFAULT_REBATE_SETTINGS, ...(period.rebateSettings || {}) },
    dailyRate: Math.max(0, Number(period.dailyRate || 0)),
    totalCapacity: Number(period.totalCapacity || 0),
    totalAllocated,
    eligibilityMode: period.eligibilityMode || ELIGIBILITY_MODE_ALL_ACTIVE,
    eligibleRollNumbers: Array.isArray(period.eligibleRollNumbers) ? period.eligibleRollNumbers : [],
    eligibleStudentCount: Number(period.eligibleStudentCount || 0),
    isArchived: Boolean(period.isArchived),
    status: period.status || "Upcoming",
    allocationStatus: period.allocationStatus || "Not configured",
    createdAt: period.createdAt,
    updatedAt: period.updatedAt,
  }
}

export const eligibilityLabel = (period) =>
  period.eligibilityMode === ELIGIBILITY_MODE_CUSTOM ? "Custom CSV" : "All active students"

/** Maps a period lifecycle status to a czero StatusBadge tone. */
export const periodStatusTone = (status) => {
  switch (status) {
    case "Open":
      return "success"
    case "Upcoming":
      return "warning"
    default:
      return "primary"
  }
}

/** Maps an allocation-window status to a czero StatusBadge tone. */
export const allocationStatusTone = (status) => {
  switch (status) {
    case "Open":
      return "success"
    case "Not started":
      return "warning"
    case "Not configured":
      return "danger"
    default:
      return "primary"
  }
}

/** Fill colour for the capacity utilisation bar, by percentage full. */
export const capacityToneColor = (percent) => {
  if (percent >= 100) return "var(--color-danger)"
  if (percent >= 85) return "var(--color-warning)"
  return "var(--color-primary)"
}

export const formatRebateType = (type = "") => (type === "long-term" ? "Long-term" : "Short-term")

export const formatRebateStatus = (status = "") => {
  if (status === "approved") return "Approved"
  if (status === "rejected") return "Rejected"
  return "Pending"
}

/** Maps a rebate status to a czero StatusBadge tone. */
export const rebateStatusTone = (status = "") => {
  if (status === "approved") return "success"
  if (status === "rejected") return "danger"
  return "warning"
}
