// Page-specific helpers for the caterer Meal Records page.
// Shared vocabulary (day-key math, formatters, labels) lives in ../catererHelpers.js.
import { buildCsvContent } from "@/utils/csvExport"
import { addDays, describeRoom, maxKey, minKey, MEAL_STATUS, SCAN_SOURCE_LABELS, toDayKey } from "../catererHelpers"

export const GRID_DAYS = 14
export const SHIFT_DAYS = 7
export const PAGE_SIZE = 25
export const BUCKET_MINUTES = 10

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
export const isDayKey = (value) => DAY_KEY.test(String(value || ""))

const parseKey = (key) => {
  const [y, m, d] = String(key).split("-").map(Number)
  return new Date(y, m - 1, d)
}

/* ---------- clock ---------- */

/** Minutes since local midnight. A function so render code never reads the clock inline. */
export const nowMinutes = () => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/** "12:30" -> 750. Returns null for anything unparseable. */
export const timeToMinutes = (value) => {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value || "").trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

const pad = (n) => String(n).padStart(2, "0")

/** Minutes since midnight -> "12:40" (24h, matching the meal slot times). */
export const minutesToClock = (minutes) => {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`
}

/** ISO timestamp -> "12:42" local, 24h. */
export const formatClock = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/* ---------- labels ---------- */

const monthShort = (key) => parseKey(key).toLocaleDateString(undefined, { month: "short" })
export const formatMonthShort = (key) => (isDayKey(key) ? monthShort(key) : "")

/** "Wed 30 Sep" */
export const formatDayTip = (key) =>
  isDayKey(key) ? parseKey(key).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) : "-"

const dayMonthYear = (key, withYear) =>
  parseKey(toDayKey(key)).toLocaleDateString(undefined, { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) })

/** "8 Oct – 20 Nov 2026"; both years shown when they differ. */
export const formatPeriodRange = (startDate, endDate) => {
  const start = toDayKey(startDate)
  const end = toDayKey(endDate)
  if (!start) return "-"
  if (!end) return dayMonthYear(start, true)
  const crossesYear = start.slice(0, 4) !== end.slice(0, 4)
  return `${dayMonthYear(start, crossesYear)} – ${dayMonthYear(end, true)}`
}

export const periodOptionLabel = (period) =>
  `${formatPeriodRange(period.startDate, period.endDate)} (${period.isCurrent ? "current" : period.isArchived ? "archived" : "upcoming"})`

/* ---------- slots & selection ---------- */

export const sortSlots = (slots = []) =>
  [...slots].sort((a, b) => (timeToMinutes(a.startTime) ?? 0) - (timeToMinutes(b.startTime) ?? 0))

/**
 * The service to show when the URL does not say.
 *   1. the period is over -> its last day, last meal
 *   2. the period has not started -> its first day, first meal
 *   3. today, the meal open now
 *   4. today, the latest meal that has already started
 *   5. yesterday's last meal (if yesterday is inside the period)
 *   6. today's first meal
 */
export const defaultSelection = ({ period, today, currentMealSlotKey, nowMin }) => {
  const slots = sortSlots(period.mealSlots)
  const start = toDayKey(period.startDate)
  const end = toDayKey(period.endDate)
  const first = slots[0]?.key || ""
  const last = slots[slots.length - 1]?.key || ""
  if (!slots.length) return { date: minKey(maxKey(today, start), end), meal: "" }
  if (today > end) return { date: end, meal: last }
  if (today < start) return { date: start, meal: first }
  if (currentMealSlotKey && slots.some((slot) => slot.key === currentMealSlotKey)) {
    return { date: today, meal: currentMealSlotKey }
  }
  const started = slots.filter((slot) => (timeToMinutes(slot.startTime) ?? Infinity) <= nowMin)
  if (started.length) return { date: today, meal: started[started.length - 1].key }
  const yesterday = addDays(today, -1)
  if (yesterday >= start) return { date: yesterday, meal: last }
  return { date: today, meal: first }
}

/* ---------- the 14-day window ---------- */

/** Keep the window's last day inside the period, and never let the window run off the start. */
export const clampWindowEnd = (end, periodStart, periodEnd) => {
  const lowest = minKey(periodEnd, addDays(periodStart, GRID_DAYS - 1))
  return maxKey(lowest, minKey(periodEnd, end))
}

export const windowFromEnd = (end, periodStart) => ({
  from: maxKey(periodStart, addDays(end, -(GRID_DAYS - 1))),
  to: end,
})

/** Where the window ends so that `date` is on screen (default: today, or period end). */
export const windowEndFor = (date, today, periodStart, periodEnd) => {
  const fallback = clampWindowEnd(today, periodStart, periodEnd)
  const { from, to } = windowFromEnd(fallback, periodStart)
  if (date >= from && date <= to) return fallback
  return clampWindowEnd(addDays(date, SHIFT_DAYS - 1), periodStart, periodEnd)
}

export const dayKeysBetween = (from, to) => {
  const keys = []
  for (let key = from; key <= to && keys.length < 120; key = addDays(key, 1)) keys.push(key)
  return keys
}

/* ---------- heatmap ---------- */

export const HEAT_STEPS = [
  { step: 0, label: "0%" },
  { step: 1, label: "Under 50%" },
  { step: 2, label: "50 to 69%" },
  { step: 3, label: "70 to 84%" },
  { step: 4, label: "85% or more" },
]

export const attendanceStep = (verified, expected) => {
  if (!(verified > 0)) return 0
  if (!(expected > 0)) return 4
  const rate = verified / expected
  if (rate < 0.5) return 1
  if (rate < 0.7) return 2
  if (rate < 0.85) return 3
  return 4
}

/**
 * future   -> after today; nothing to show
 * upcoming -> today, meal not started; roster exists but nobody could have eaten
 * open     -> started or finished
 */
export const cellPhase = ({ date, slot, today, nowMin }) => {
  if (date > today) return "future"
  if (date === today) {
    const start = timeToMinutes(slot.startTime)
    if (start !== null && nowMin < start) return "upcoming"
  }
  return "open"
}

/* ---------- arrival curve ---------- */

export const buildArrivalCurve = (students = [], slot = null) => {
  const start = timeToMinutes(slot?.startTime)
  let end = timeToMinutes(slot?.endTime)
  if (start === null || end === null) return null
  if (end <= start) end += 1440
  const count = Math.max(1, Math.ceil((end - start) / BUCKET_MINUTES))
  const buckets = Array.from({ length: count }, (_, index) => {
    const from = start + index * BUCKET_MINUTES
    const to = Math.min(from + BUCKET_MINUTES, end)
    return { index, from, to, label: `${minutesToClock(from)}–${minutesToClock(to)}`, count: 0 }
  })
  let total = 0
  for (const row of students) {
    if (row.status !== "verified" || !row.verifiedAt) continue
    const at = new Date(row.verifiedAt)
    if (Number.isNaN(at.getTime())) continue
    let minutes = at.getHours() * 60 + at.getMinutes()
    if (end > 1440 && minutes < start) minutes += 1440
    const index = Math.min(count - 1, Math.max(0, Math.floor((minutes - start) / BUCKET_MINUTES)))
    buckets[index].count += 1
    total += 1
  }
  let peak = null
  for (const bucket of buckets) if (bucket.count > 0 && (!peak || bucket.count > peak.count)) peak = bucket
  return { buckets, total, peak, max: peak?.count || 0, startLabel: minutesToClock(start), endLabel: minutesToClock(end) }
}

/* ---------- roster ---------- */

export const countByStatus = (students = []) => {
  const counts = { verified: 0, missed: 0, pending: 0, "on-rebate": 0 }
  for (const row of students) if (row.status in counts) counts[row.status] += 1
  return counts
}

export const rebateEndLabel = (rebate) => (rebate?.endDate ? toDayKey(rebate.endDate) : "")

/* ---------- CSV ---------- */

export const buildRosterCsv = (record) => {
  const rows = (record?.students || []).map((row) => {
    const student = row.student || {}
    let time = ""
    if (row.verifiedAt) time = `${record.date} ${formatClock(row.verifiedAt)}`
    else if (row.status === "on-rebate" && row.rebate?.endDate) time = `Away until ${rebateEndLabel(row.rebate)}`
    return [
      student.name || "",
      student.rollNumber || "",
      describeRoom(student),
      MEAL_STATUS[row.status]?.label || row.status || "",
      time,
      SCAN_SOURCE_LABELS[row.verificationSource] || "",
    ]
  })
  return buildCsvContent(["Name", "Roll number", "Hostel and room", "Status", "Time", "Method"], rows)
}

export const downloadCsv = (filename, content) => {
  // BOM so Excel reads names as UTF-8.
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
