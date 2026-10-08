// Page-specific helpers for the caterer Rebates page. Date-key math itself lives
// in ../catererHelpers.js; this file only adds what the rebate views need.
import { useEffect, useState } from "react"
import { addDays, diffDays, toDayKey, formatDayMonth } from "../catererHelpers"

export const FORECAST_DAYS = 14
export const COMING_UP_DAYS = 7
export const REQUESTS_PAGE_SIZE = 20
export const OVERVIEW_REFRESH_MS = 5 * 60 * 1000

const parseDay = (key) => {
  const [y, m, d] = String(key || "").split("-").map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}

const pad = (n) => String(n).padStart(2, "0")
const keyOf = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** "Fri 10 Oct" */
export const formatDayCompact = (key) => {
  const date = parseDay(key)
  return date ? date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) : "-"
}

export const dayOfMonth = (key) => parseDay(key)?.getDate() ?? ""

export const isWeekend = (key) => {
  const day = parseDay(key)?.getDay()
  return day === 0 || day === 6
}

/** First and last calendar day of the month containing `key`. */
export const monthBounds = (key) => {
  const date = parseDay(key) || new Date()
  return {
    first: keyOf(new Date(date.getFullYear(), date.getMonth(), 1)),
    last: keyOf(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  }
}

export const shiftMonth = (key, delta) => {
  const date = parseDay(key) || new Date()
  return keyOf(new Date(date.getFullYear(), date.getMonth() + delta, 1))
}

/** Monday-first weeks of day keys covering the month; each week has 7 keys. */
export const buildMonthWeeks = (monthKey) => {
  const { first, last } = monthBounds(monthKey)
  const firstWeekday = (parseDay(first).getDay() + 6) % 7 // Monday = 0
  const start = addDays(first, -firstWeekday)
  const total = Math.ceil((firstWeekday + diffDays(first, last) + 1) / 7) * 7
  const weeks = []
  for (let i = 0; i < total; i += 7) {
    weeks.push(Array.from({ length: 7 }, (_, j) => addDays(start, i + j)))
  }
  return weeks
}

/** Weekday headings, Monday first, in the user's locale. */
export const weekdayHeadings = () => {
  const monday = new Date(2024, 0, 1) // a Monday
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    return date.toLocaleDateString(undefined, { weekday: "short" })
  })
}

/** Rebate day keys. dateKeys are authoritative; the ISO dates are a fallback. */
export const rebateStart = (rebate) => rebate?.dateKeys?.[0] || toDayKey(rebate?.startDate)
export const rebateEnd = (rebate) => rebate?.dateKeys?.at?.(-1) || toDayKey(rebate?.endDate) || rebateStart(rebate)

/** "12 – 16 Oct", "28 Sep – 2 Oct", "12 Oct". */
export const rangeLabel = (rebate) => {
  const start = rebateStart(rebate)
  const end = rebateEnd(rebate)
  if (!start) return "-"
  if (!end || start === end) return formatDayMonth(start)
  const a = parseDay(start)
  const b = parseDay(end)
  if (a && b && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    const month = b.toLocaleDateString(undefined, { month: "short" })
    return `${a.getDate()} – ${b.getDate()} ${month}`
  }
  return `${formatDayMonth(start)} – ${formatDayMonth(end)}`
}

export const TYPE_LABELS = { "short-term": "Short-term", "long-term": "Long-term" }
export const typeLabel = (type) => TYPE_LABELS[type] || type || ""

/** The first day the student eats again: day after the last rebate day. */
export const backOnKey = (rebate) => addDays(rebateEnd(rebate), 1)

export const backLabel = (rebate, todayKey) => {
  const back = backOnKey(rebate)
  return diffDays(todayKey, back) === 1 ? "Back tomorrow" : `Back on ${formatDayCompact(back)}`
}

/** One sentence per forecast column, shared by the tooltip and the aria-label. */
export const describeForecastDay = (day) => {
  const head = `${formatDayCompact(day.date)}: `
  if (!day.periodId) return `${head}no service`
  const parts = [`cook for ${day.expectedCount} of ${day.allocatedCount}`, `${day.onRebateCount} away`]
  if (day.pendingCount > 0) parts.push(`${day.pendingCount} pending`)
  if (day.startingCount > 0) parts.push(`${day.startingCount} leaving`)
  if (day.returningCount > 0) parts.push(`${day.returningCount} back`)
  return head + parts.join(", ")
}

/** Calendar shading: 0 = none, 1..4 = relative to the busiest day of the month. */
export const heatLevel = (count, max) => {
  if (!count || !max) return 0
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)))
}

export const summarizeMonth = (days) => {
  const served = (days || []).filter((day) => day.periodId)
  if (!served.length) return null
  let busiest = served[0]
  let total = 0
  for (const day of served) {
    total += day.onRebateCount
    if (day.onRebateCount > busiest.onRebateCount) busiest = day
  }
  return { busiest, average: Math.round(total / served.length) }
}

export const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
