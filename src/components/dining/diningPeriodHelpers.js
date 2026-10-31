/**
 * Shared helpers, constants and serializers for the admin Dining Periods surface.
 * Kept framework-agnostic (no JSX) so it can be reused by cards, drawer and form.
 */

export const ELIGIBILITY_MODE_ALL_HOSTELLERS = "all-hostellers"
export const ELIGIBILITY_MODE_ALL_ACTIVE = "all-active"
export const ELIGIBILITY_MODE_CUSTOM = "custom"

const ELIGIBILITY_LABELS = {
  [ELIGIBILITY_MODE_ALL_HOSTELLERS]: "All hostellers",
  [ELIGIBILITY_MODE_ALL_ACTIVE]: "All active students",
  [ELIGIBILITY_MODE_CUSTOM]: "Custom CSV",
}

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
    registrationEnabled: period.registrationEnabled !== false,
    allocationStartAt: period.allocationStartAt,
    allocationEndAt: period.allocationEndAt,
    notificationAt: period.notificationAt || null,
    notificationSentAt: period.notificationSentAt || null,
    autoAllocationAt: period.autoAllocationAt || null,
    autoAllocation: period.autoAllocation || null,
    catererIds: Array.isArray(period.catererIds) ? period.catererIds.map(getIdValue).filter(Boolean) : [],
    caterers: Array.isArray(period.caterers) ? period.caterers : [],
    catererCapacities,
    mealSlots:
      Array.isArray(period.mealSlots) && period.mealSlots.length > 0 ? period.mealSlots : DEFAULT_MEAL_SLOTS,
    weekSchedule: Array.isArray(period.weekSchedule) ? period.weekSchedule : [],
    dateSchedule: Array.isArray(period.dateSchedule) ? period.dateSchedule : [],
    dailyRate: Math.max(0, Number(period.dailyRate || 0)),
    totalCapacity: Number(period.totalCapacity || 0),
    totalAllocated,
    eligibilityMode: period.eligibilityMode || ELIGIBILITY_MODE_ALL_ACTIVE,
    eligibleRollNumbers: Array.isArray(period.eligibleRollNumbers) ? period.eligibleRollNumbers : [],
    eligibleStudentCount: Number(period.eligibleStudentCount || 0),
    tags: Array.isArray(period.tags)
      ? period.tags.map((tag) => ({
          id: tag.id || tag._id,
          name: tag.name || "",
          question: tag.question || "",
          defaultValue: typeof tag.defaultValue === "boolean" ? tag.defaultValue : null,
          counts: {
            yes: Number(tag.counts?.yes || 0),
            no: Number(tag.counts?.no || 0),
            answered: Number(tag.counts?.answered || 0),
          },
        }))
      : [],
    isArchived: Boolean(period.isArchived),
    status: period.status || "Upcoming",
    allocationStatus: period.allocationStatus || "Not configured",
    createdAt: period.createdAt,
    updatedAt: period.updatedAt,
  }
}

/**
 * Lifecycle of a period's scheduled auto-allocation:
 * "none" | "scheduled" | "running" | "completed" | "failed".
 * The time locks once the server reports any run status.
 */
export const getAutoAllocationState = (period) => {
  const status = period?.autoAllocation?.status
  if (status === "running" || status === "completed" || status === "failed") return status
  return period?.autoAllocationAt ? "scheduled" : "none"
}

// Mirrors the server: a failed run, or one stuck "running" over an hour, can be given a new time.
const AUTO_ALLOCATION_STALE_MS = 60 * 60 * 1000

export const isAutoAllocationRearmable = (period, now = Date.now()) => {
  const run = period?.autoAllocation
  if (run?.status === "failed") return true
  if (run?.status !== "running") return false
  const startedAt = run.startedAt ? new Date(run.startedAt).getTime() : null
  return !startedAt || now - startedAt > AUTO_ALLOCATION_STALE_MS
}

/** Short result line for a run, or "" while nothing has run yet. */
export const autoAllocationResultText = (autoAllocation) => {
  if (!autoAllocation?.status) return ""
  if (autoAllocation.status === "running") return "Auto-allocation is running…"
  if (autoAllocation.status === "failed")
    return `Auto-allocation failed${autoAllocation.error ? `: ${autoAllocation.error}` : "."}`
  const assigned = Number(autoAllocation.assigned || 0)
  const leftOver = Number(autoAllocation.leftOver || 0)
  return `Assigned ${assigned} · ${leftOver} left over`
}

export const eligibilityLabel = (period) => ELIGIBILITY_LABELS[period.eligibilityMode] || ELIGIBILITY_LABELS[ELIGIBILITY_MODE_ALL_ACTIVE]

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
    case "Manual":
      // No self-registration window; admin assigns caterers manually.
      return "primary"
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

const shortDay = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" })
}

export const periodRangeLabel = (period) => {
  const start = shortDay(period?.startDate)
  const end = shortDay(period?.endDate)
  if (!start) return ""
  return end && end !== start ? `${start} – ${end}` : start
}

/**
 * Where a rebate's days land, from the server's `placements` / `unplacedDayCount`.
 * Returns `[{ key, label }]`, e.g. "1 Jan – 31 Jan · Annapurna (4d)" and
 * "Not in a dining period yet (2d)". Legacy rows with no `placements` field
 * fall back to the old rebate.period / rebate.caterer; with neither they get "-".
 * `compact` drops the period range (student list).
 */
export const getRebateWhereLines = (rebate, { compact = false } = {}) => {
  if (!rebate) return []
  const placements = Array.isArray(rebate.placements) ? rebate.placements : null
  const lines = []

  if (placements) {
    placements.forEach((placement, index) => {
      const range = compact ? "" : periodRangeLabel(placement.period)
      const caterer = placement.caterer?.name || "No caterer yet"
      const days = `${Number(placement.dayCount) || 0}d`
      const where = [range, caterer].filter(Boolean).join(" · ")
      lines.push({ key: `${placement.periodId || index}`, label: `${where} (${days})` })
    })
    const unplaced = Number(rebate.unplacedDayCount) || 0
    if (unplaced > 0) {
      lines.push({ key: "unplaced", label: `Not in a dining period yet${placements.length > 0 ? ` (${unplaced}d)` : ""}` })
    } else if (placements.length === 0) {
      lines.push({ key: "unplaced", label: "Not in a dining period yet" })
    }
    return lines
  }

  // Legacy rows (before standalone rebates) only carry a single period + caterer.
  const caterer = rebate.caterer?.name
  const range = compact ? "" : periodRangeLabel(rebate.period)
  const label = [range, caterer].filter(Boolean).join(" · ")
  return label ? [{ key: "legacy", label }] : []
}

/** Months a rebate can be requested ahead; the server also sends this as `rules.maxAdvanceMonths`. */
export const DEFAULT_MAX_ADVANCE_MONTHS = 6

/** Day key (YYYY-MM-DD) `months` calendar months after `todayKey`, clamped to the month's last day. */
export const addMonthsToDayKey = (todayKey, months) => {
  const [year, month, day] = String(todayKey || "").split("-").map(Number)
  if (!year || !month || !day) return ""
  const target = new Date(year, month - 1 + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(day, lastDay))
  const pad = (n) => String(n).padStart(2, "0")
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`
}
